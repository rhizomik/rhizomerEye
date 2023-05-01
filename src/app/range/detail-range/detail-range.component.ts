import { Component, Input, OnInit } from '@angular/core';
import { Observable, of, OperatorFunction, Subject, Subscription } from 'rxjs';
import { BreadcrumbService } from '../../breadcrumb/breadcrumb.service';
import { RangeService } from '../range.service';
import { Facet } from '../../facet/facet';
import { Range } from '../range';
import { RangeValue } from '../rangeValue';
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

  //----- todo: limpiar lo que he tocado aqui, no se usa al final
  isDateTime: Boolean = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    public translate: TranslateService,
    private rangeService: RangeService) {
  }

  ngOnInit() {
    if (this.range.expanded) {
      this.firstValues();
    }

    if (this.range.defaultLabel == "dateTime" || this.range.defaultLabel == "gYear") {
      console.log("FECHAAAAA" + this.range.defaultLabel)
      this.isDateTime = true
    } else {
      console.log("NO ES FECHAAA" + this.range.defaultLabel)
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
            .pipe(map(response => response.map(value => new RangeValue(value, this.facet, filters)))).subscribe(
              (rangeValues: RangeValue[]) => {
                this.range.values = rangeValues;
                this.filter?.values
                  .filter(filterValue => !this.range.values.find(value => value.value === filterValue.value))
                  .forEach(filterValue =>
                    this.rangeService.getValue(this.datasetId, this.classId, this.facet.curie,
                      this.range.curie, filterValue.value, filters)
                      .subscribe(value => this.range.values.push(new RangeValue(value, this.facet, filters))));
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

  filterValue(value: RangeValue) {
    let operator = Operator.NONE;
    if (this.filter?.values?.length > 0) {
      operator = this.isOperatorOr ? Operator.OR : Operator.AND;
    }
    if (!value.selected && !value.negated) {
      value.selected = true;
      value.negated = false;
      this.breadcrumbService.addFacetFilterValue(this.classId, this.facet, this.range, value, operator);
    } else if (value.selected && !value.negated && !this.isOperatorOr) {
      value.selected = false;
      value.negated = true;
      this.breadcrumbService.negateFacetFilterValue(this.classId, this.facet, this.range, value, operator);
    } else {
      value.selected = false;
      value.negated = false;
      this.breadcrumbService.removeFacetFilterValue(this.classId, this.facet, this.range, value);
    }
  }

  valueToolTip(value: RangeValue) {
    let text: string = value.value;
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.slice(1, text.length - 1);
    }
    return text;
  }

  search: OperatorFunction<string, readonly RangeValue[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term => term.length < 3 ? of([]) :
        this.rangeService.getValuesContaining(this.datasetId, this.classId, this.facet.curie, this.range.curie,
          this.isOperatorOr ? [] : this.breadcrumbService.filters, 10, term, this.translate.currentLang).pipe(
            map(values => values.map(value => new RangeValue(value, this.facet, this.breadcrumbService.filters))),
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
      filter = new Filter(this.classId, this.facet, this.range, Operator.NONE, []);
    }
    if (changeContext.pointerType == PointerType.Min) {
      filter.values = filter.values.filter(value => !value.value.startsWith('"≧'));
      filter.values.push(new RangeValue({ value: '≧' + changeContext.value }, this.facet, []));
    } else if (changeContext.pointerType == PointerType.Max) {
      filter.values = filter.values.filter(value => !value.value.startsWith('"≦'));
      filter.values.push(new RangeValue({ value: '≦' + changeContext.highValue }, this.facet, []));
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
      if (filter.operator == Operator.OR) {
        // TODO: negation not supported with operator OR, switch all negated to selected
        filter.values = filter.values.map(value => { value.negated = false; return value; } );
      }
      this.breadcrumbService.addFacetFilter(filter);
    }
  }

  operatorLabel(): string {
    if (this.isOperatorOr) {
      return this.translate.instant('search.Or');
    } else {
      return this.translate.instant('search.And');
    }
  }
}
