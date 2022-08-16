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

  clearValues(range: Range) {
    this.subscription.unsubscribe();
    range.values = undefined;
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

  // search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(500),
  //     distinctUntilChanged(),
  //     tap(() => this.searching = true),
  //     switchMap(term => term.length < 3 ? of([]) :
  //       this.classService.getTopClassesContaining(this.datasetId, 10, term).pipe(
  //         tap(() => this.searchFailed = false),
  //         catchError(() => {
  //           this.searchFailed = true;
  //           return of([]);
  //         }))
  //     ),
  //     tap(() => this.searching = false)
  //   )

  selectItem($event: NgbTypeaheadSelectItemEvent, autocomplete) {
    $event.preventDefault();
    this.filterValue($event.item);
    autocomplete.value = '';
  }
}
