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
import { DatasetService } from '../../dataset/dataset.service';

enum RangeStatus {UNEXPANDED, LOADING, EXPANDED}

@Component({
  selector: 'app-type-range',
  templateUrl: './type-range.component.html',
  styleUrls: ['./type-range.component.css']
})
export class TypeRangeComponent implements OnInit {
  @Input() range: Range = new Range();
  @Input() facet: Facet = new Facet();
  @Input() datasetId: string;
  @Input() text: string;
  @Input() ngUnsubscribe: Subject<void> = new Subject<void>();
  status = RangeStatus.EXPANDED;
  rangeStatus = RangeStatus;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private datasetService: DatasetService) {
  }

  ngOnInit() {
    this.range.expanded = true;
    this.first100Values(this.range);
  }

  first100Values(range: Range) {
    this.status = RangeStatus.LOADING;
    this.datasetService.searchTypesFacetValues(this.datasetId, this.text).subscribe(
      (values: Value[]) => {
        range.values = values.map(value => new Value(value, this.facet, []));
        this.status = RangeStatus.EXPANDED;
      });
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

  exploreType(value: Value) {
  }
}
