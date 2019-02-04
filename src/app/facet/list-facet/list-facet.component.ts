import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { BreadcrumbService } from '../../breadcrumb/breadcrumb.service';
import { ClassService } from '../../class/class.service';
import { FacetService } from '../facet.service';
import { RangeService } from '../../range/range.service';
import { Class } from '../../class/class';
import { Facet } from '../facet';
import { Range } from '../../range/range';
import { Value } from '../../range/value';
import { Description } from '../../class/description';
import { Filter } from '../../breadcrumb/filter';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-list-facet',
  templateUrl: './list-facet.component.html',
  styleUrls: ['./list-facet.component.css']
})
export class ListFacetComponent implements OnInit, OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  datasetId: string;
  classId: string;
  facets: Facet[] = [];
  totalFacets = 0;
  totalInstances = 0;
  resources: Description[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private classService: ClassService,
    private facetService: FacetService,
    private rangeService: RangeService) {
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did');
    this.classId = this.route.snapshot.paramMap.get('cid');
    this.classService.get(this.datasetId, this.classId).subscribe(
      (datasetClass: Class) => this.totalInstances = datasetClass.instanceCount);
    this.breadcrumbService.filtersSelection.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (filters: Filter[]) => this.refreshInstances(this.datasetId, this.classId, filters));
    this.facetService.getAll(this.datasetId, this.classId).subscribe(
      (facets: Facet[]) => {
        this.facets = facets.sort((a, b) => a.label.localeCompare(b.label));
        this.totalFacets = facets.length;
        this.facets.map(facet =>
            this.rangeService.getAll(this.datasetId, this.classId, facet.curie).subscribe(
              ranges => facet.ranges = ranges)
        );
      });
  }

  refreshInstances(datasetId: string, classId: string, filters: Filter[]) {
    this.classService.getInstances(datasetId, classId, filters).subscribe(
      (instances: any) => {
        if (instances['@graph']) {
          this.resources = instances['@graph']
          .filter(instance => instance['@type'])
          .map(instance => new Description(instance, instances['@context']));
        } else if (instances['@type']) {
          this.resources = [new Description(instances)];
        } else {
          this.resources = [];
        }
      });
  }

  firstValues(facet: Facet, range: Range) {
    this.breadcrumbService.filtersSelection.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (filters: Filter[]) => {
        this.rangeService.getValues(this.datasetId, this.classId, facet.curie, range.curie, filters).subscribe(
          (values: Value[]) => range.values = values.map(value => new Value(value, facet, filters)));
      });
  }

  filterValue(facet: Facet, value: Value) {
    if (!value.selected) {
      this.breadcrumbService.addFacetFilter(this.classId, facet, value);
      value.selected = true;
    } else {
      this.breadcrumbService.removeFacetFilter(this.classId, facet, value);
      value.selected = false;
    }
  }

  showSearchResults(facets) {
    this.facets = facets;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.breadcrumbService.clearFilter();
  }
}
