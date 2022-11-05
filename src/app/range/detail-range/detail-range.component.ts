import { Component, Input, OnInit } from '@angular/core';
import { Observable, of, OperatorFunction, Subject, Subscription } from 'rxjs';
import { BreadcrumbService } from '../../breadcrumb/breadcrumb.service';
import { RangeService } from '../range.service';
import { Facet } from '../../facet/facet';
import { Range } from '../range';
import { Value } from '../value';
import { Filter, Operator } from '../../breadcrumb/filter';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ChangeContext, PointerType } from '@angular-slider/ngx-slider';

enum RangeStatus {UNEXPANDED, LOADING, EXPANDED}

@Component({
  selector: 'app-detail-range',
  templateUrl: './detail-range.component.html',
  styleUrls: ['./detail-range.component.css']
})
export class DetailRangeComponent implements OnInit {
  @Input() range: Range = new Range();
  @Input() facet: Facet = new Facet();
  @Input() datasetId: string;
  @Input() classId: string;
  @Input() ngUnsubscribe: Subject<void> = new Subject<void>();
  status = RangeStatus.UNEXPANDED;
  rangeStatus = RangeStatus;
  searching = false;
  searchFailed = false;
  isOperatorOr = false;
  filter: Filter;
  private subscription: Subscription;
  private SLIDER_DATATYPES = ['xsd:int', 'xsd:integer', 'xsd:gYear', 'xsd:decimal', 'xsd:float', 'xsd:double'];
  private STEP1_DATATYPES = ['xsd:int', 'xsd:integer', 'xsd:gYear'];

  constructor(
    private breadcrumbService: BreadcrumbService,
    public translate: TranslateService,
    private rangeService: RangeService) {
  }

  ngOnInit() {
    if (this.range.expanded) {
      this.firstValues();
    }
  }

  firstValues() {
    if (this.isSliderDatatype()) {
      this.subscription = this.breadcrumbService.filtersSelection.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        (filters: Filter[]) => {
          this.status = RangeStatus.LOADING;
          this.rangeService.getMinMax(this.datasetId, this.classId, this.facet.curie, this.range.curie, filters)
            .subscribe((range: Range) => {
              this.range.min = range.min;
              this.range.max = range.max;
              this.status = RangeStatus.EXPANDED;
            });
        });
    } else {
      this.subscription = this.breadcrumbService.filtersSelection.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        (filters: Filter[]) => {
          this.status = RangeStatus.LOADING;
          this.filter = this.breadcrumbService.getFacetFilter(this.classId, this.facet, this.range);
          this.isOperatorOr = this.filter && this.filter.operator == Operator.OR;
          this.rangeService.getValues(this.datasetId, this.classId, this.facet.curie, this.range.curie, filters)
            .subscribe((values: Value[]) => {
              this.range.values = values.map(value => new Value(value, this.facet, filters));
              this.status = RangeStatus.EXPANDED;
            });
        });
    }
  }

  clearValues(range: Range) {
    this.subscription.unsubscribe();
    range.values = range.min = range.max = undefined;
    this.status = RangeStatus.UNEXPANDED;
  }

  filterValue(value: Value) {
    if (!value.selected) {
      let operator = Operator.NONE;
      if (this.filter?.values?.length > 0) {
        operator = this.isOperatorOr ? Operator.OR : Operator.AND;
      }
      this.breadcrumbService.addFacetFilterValue(this.classId, this.facet, this.range, value.value, operator);
      value.selected = true;
    } else {
      this.breadcrumbService.removeFacetFilterValue(this.classId, this.facet, this.range, value.value);
      value.selected = false;
    }
  }

  valueToolTip(value: Value) {
    let text: string = value.value;
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.slice(1, text.length - 1);
    }
    if (text !== value.getLabel(this.translate.currentLang)) {
      return text;
    } else {
      return '';
    }
  }

  search: OperatorFunction<string, readonly Value[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term => term.length < 3 ? of([]) :
        this.rangeService.getValuesContaining(this.datasetId, this.classId, this.facet.curie, this.range.curie,
          this.isOperatorOr ? [] : this.breadcrumbService.filters, 10, term, this.translate.currentLang).pipe(
            map(values => values.map(value => new Value(value, this.facet, this.breadcrumbService.filters))),
            tap(() => this.searchFailed = false),
            catchError(() => {
              this.searchFailed = true;
              return of([]);
            }))
        ),
      tap(() => this.searching = false)
    );

  selectItem($event: NgbTypeaheadSelectItemEvent, autocomplete) {
    $event.preventDefault();
    this.filterValue($event.item);
    autocomplete.value = '';
  }

  changeRange(changeContext: ChangeContext) {
    let filter = this.breadcrumbService.popFacetFilter(this.classId, this.facet, this.range);
    if (!filter) {
      filter = new Filter(this.classId, this.facet, this.range, '');
    }
    if (changeContext.pointerType == PointerType.Min) {
      filter.values = filter.values.filter(value => !value.startsWith('"≧'));
      filter.values.push('"≧' + changeContext.value + '"');
    } else if (changeContext.pointerType == PointerType.Max) {
      filter.values = filter.values.filter(value => !value.startsWith('"≦'));
      filter.values.push('"≦' + changeContext.highValue + '"');
    }
    if (filter.values.length > 1) {
      filter.operator = Operator.AND;
    }
    this.breadcrumbService.addFacetFilter(filter);
  }

  sliderOptions() {
    const floor = this.range.min;
    const ceil = this.range.max;
    const noSwitching = true;
    const step = this.STEP1_DATATYPES.includes(this.range.curie) ? 1 : (ceil - floor)/100;
    return {floor, ceil, noSwitching, step};
  }

  isSliderDatatype(): boolean {
    return this.SLIDER_DATATYPES.includes(this.range.curie);
  }

  switchOperator() {
    let filter = this.breadcrumbService.popFacetFilter(this.classId, this.facet, this.range);
    if (filter) {
      filter.operator = Operator.NONE;
      if (filter.values && filter.values.length > 0) {
        filter.operator = this.isOperatorOr ? Operator.OR : Operator.AND;
      }
      this.breadcrumbService.addFacetFilter(filter);
    }
  }
}
