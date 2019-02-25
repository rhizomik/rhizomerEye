import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { BreadcrumbService } from '../../breadcrumb/breadcrumb.service';
import { ClassService } from '../../class/class.service';
import { FacetService } from '../facet.service';
import { RangeService } from '../../range/range.service';
import { Class } from '../../class/class';
import { Facet } from '../facet';
import { Range } from '../../range/range';
import { Value } from '../../range/value';
import { Description } from '../../description/description';
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
  retrievedFacets = 0;
  relevance = 0.2;
  totalInstances = 0;
  filteredInstances = 0;
  datasetClass: Class = new Class();
  resources: Description[] = [];
  anonResources: Map<string, Description> = new Map<string, Description>();

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
    this.loadFacetClass();
    this.breadcrumbService.filtersSelection.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (filters: Filter[]) => this.refreshInstances(this.datasetId, this.classId, filters));
    this.refreshFacets(this.relevance);
  }

  loadFacetClass() {
    this.classService.get(this.datasetId, this.classId).subscribe(
      (datasetClass: Class) => {
        this.datasetClass = datasetClass;
        this.totalInstances = datasetClass.instanceCount;
      });
  }

  refreshFacets(relevance: number) {
    this.facetService.getAllRelevant(this.datasetId, this.classId, relevance).subscribe(
      (facets: Facet[]) => {
        this.facets = facets.sort((a, b) => a.label.localeCompare(b.label));
        this.retrievedFacets = facets.length;
        this.loadFacetClass();
        this.facets.map(facet =>
          this.rangeService.getAll(this.datasetId, this.classId, facet.curie).subscribe(
            ranges => facet.ranges = ranges)
        );
      });
  }

  refreshInstances(datasetId: string, classId: string, filters: Filter[]) {
    this.filteredInstances = 0;
    forkJoin([
      this.classService.getInstances(datasetId, classId, filters),
      this.classService.getInstancesCount(datasetId, classId, filters)])
    .subscribe(
      ([instances, count]) => {
        if (instances['@graph']) {
          this.resources = instances['@graph']
            .filter(instance => instance['@type'] &&
              Description.isOfType(instance['@type'], this.datasetClass.uri, instances['@context']) )
            .map(instance => new Description(instance, instances['@context']));
          instances['@graph']
            .filter(instance => (<string>instance['@id']).startsWith('_:'))
            .map(instance => this.anonResources.set( instance['@id'], new Description(instance, instances['@context'])));
        } else if (instances['@type']) {
          this.resources = [new Description(instances, instances['@context'])];
        } else {
          this.resources = [];
        }
        this.filteredInstances = count;
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
      this.breadcrumbService.addFacetFilter(this.classId, facet, value.value);
      value.selected = true;
    } else {
      this.breadcrumbService.removeFacetFilter(this.classId, facet, value.value);
      value.selected = false;
    }
  }

  filterAll(facet: Facet) {
    if (!facet.selected) {
      this.breadcrumbService.addFacetFilter(this.classId, facet, null);
      facet.selected = true;
    } else {
      this.breadcrumbService.removeFacetFilter(this.classId, facet, null);
      facet.selected = false;
    }
  }

  loadAllFacets() {
    this.refreshFacets(0);
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
