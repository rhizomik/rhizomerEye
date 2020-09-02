import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { BreadcrumbService } from '../../breadcrumb/breadcrumb.service';
import { RangeService } from '../../range/range.service';
import { Facet } from '../facet';
import { Range } from '../../range/range';
import { Value } from '../../range/value';
import { Filter } from '../../breadcrumb/filter';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';

enum FacetStatus {UNEXPANDED, LOADING, EXPANDED}

@Component({
  selector: 'app-detail-facet',
  templateUrl: './detail-facet.component.html',
  styleUrls: ['./detail-facet.component.css']
})
export class DetailFacetComponent implements OnInit, OnDestroy {
  @Input() facet: Facet = new Facet();
  @Input() datasetId: string;
  @Input() classId: string;
  @Input() ngUnsubscribe: Subject<void> = new Subject<void>();
  status = FacetStatus.UNEXPANDED;
  facetStatus = FacetStatus;
  searching = false;
  searchFailed = false;
  private subscription: Subscription;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private rangeService: RangeService) {
  }

  ngOnInit() {}

  firstValues(range: Range) {
    this.subscription = this.breadcrumbService.filtersSelection.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (filters: Filter[]) => {
        this.status = FacetStatus.LOADING;
        this.rangeService.getValues(this.datasetId, this.classId, this.facet.curie, range.curie, filters).subscribe(
          (values: Value[]) => {
            range.values = values.map(value => new Value(value, this.facet, filters));
            this.status = FacetStatus.EXPANDED;
          });
      });
  }

  clearValues(range: Range) {
    this.subscription.unsubscribe();
    range.values = [];
    this.status = FacetStatus.UNEXPANDED;
  }

  filterValue(value: Value) {
    if (!value.selected) {
      this.breadcrumbService.addFacetFilter(this.classId, this.facet, value.value);
      value.selected = true;
    } else {
      this.breadcrumbService.removeFacetFilter(this.classId, this.facet, value.value);
      value.selected = false;
    }
  }

  filterAll() {
    if (!this.facet.selected) {
      this.breadcrumbService.addFacetFilter(this.classId, this.facet, null);
      this.facet.selected = true;
    } else {
      this.breadcrumbService.removeFacetFilter(this.classId, this.facet, null);
      this.facet.selected = false;
    }
  }

  valueToolTip(value: Value) {
    let text: string = value.value;
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.slice(1, text.length - 1);
    }
    if (text !== value.label) {
      return text;
    } else {
      return '';
    }
  }

  search(range: Range): (text$: Observable<string>) => Observable<Value[]> {
    return (text$: Observable<string>) => text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term => term.length < 3 ? of([]) :
        this.rangeService.getValuesContaining(this.datasetId, this.classId, this.facet.curie, range.curie,
          this.breadcrumbService.filters, 10, term).pipe(
            map(values => values.map(value => new Value(value, this.facet, this.breadcrumbService.filters))),
            tap(() => this.searchFailed = false),
            catchError(() => {
              this.searchFailed = true;
              return of([]);
            }))
        ),
      tap(() => this.searching = false)
    );
  }

  selectItem($event: NgbTypeaheadSelectItemEvent, autocomplete) {
    $event.preventDefault();
    this.filterValue($event.item);
    autocomplete.value = '';
  }

  ngOnDestroy() {}
}
