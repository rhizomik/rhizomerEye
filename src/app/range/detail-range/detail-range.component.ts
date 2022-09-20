import { Component, Input, OnInit } from '@angular/core';
import { Observable, of, OperatorFunction, Subject, Subscription } from 'rxjs';
import { BreadcrumbService } from '../../breadcrumb/breadcrumb.service';
import { RangeService } from '../range.service';
import { Facet } from '../../facet/facet';
import { Range } from '../range';
import { Value } from '../value';
import { Filter } from '../../breadcrumb/filter';
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
      this.firstValues(this.range);
    }
  }

  firstValues(range: Range) {
    if (this.isSliderDatatype(range.curie)) {
      this.subscription = this.breadcrumbService.filtersSelection.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        (filters: Filter[]) => {
          this.status = RangeStatus.LOADING;
          this.rangeService.getMinMax(this.datasetId, this.classId, this.facet.curie, range.curie, filters).subscribe(
            (range: Range) => {
              this.range.min = range.min;
              this.range.max = range.max;
              this.status = RangeStatus.EXPANDED;
            });
        });
    } else {
      this.subscription = this.breadcrumbService.filtersSelection.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        (filters: Filter[]) => {
          this.status = RangeStatus.LOADING;
          this.rangeService.getValues(this.datasetId, this.classId, this.facet.curie, range.curie, filters).subscribe(
            (values: Value[]) => {
              range.values = values.map(value => new Value(value, this.facet, filters));
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
      this.breadcrumbService.addFacetFilter(this.classId, this.facet, this.range, value.value);
      value.selected = true;
    } else {
      this.breadcrumbService.removeFacetFilter(this.classId, this.facet, this.range, value.value);
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
          this.breadcrumbService.filters, 10, term, this.translate.currentLang).pipe(
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
    if (changeContext.pointerType == PointerType.Min) {
      this.breadcrumbService.clearFacetFiltersStartingWith(this.classId, this.facet, this.range, '≧');
      this.breadcrumbService.addFacetFilter(this.classId, this.facet, this.range, '≧' + changeContext.value);
    } else if (changeContext.pointerType == PointerType.Max) {
      this.breadcrumbService.clearFacetFiltersStartingWith(this.classId, this.facet, this.range, '≦');
      this.breadcrumbService.addFacetFilter(this.classId, this.facet, this.range, '≦' + changeContext.highValue);
    }
  }

  sliderOptions() {
    const floor = this.range.min;
    const ceil = this.range.max;
    const noSwitching = true;
    const step = this.STEP1_DATATYPES.includes(this.range.curie) ? 1 : (ceil - floor)/100;
    return {floor, ceil, noSwitching, step};
  }

  private isSliderDatatype(curie: string): boolean {
    return this.SLIDER_DATATYPES.includes(curie);
  }
}
