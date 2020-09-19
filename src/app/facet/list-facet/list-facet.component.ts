import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { BreadcrumbService } from '../../breadcrumb/breadcrumb.service';
import { ClassService } from '../../class/class.service';
import { FacetService } from '../facet.service';
import { RangeService } from '../../range/range.service';
import { Class } from '../../class/class';
import { Facet } from '../facet';
import { Description } from '../../description/description';
import { Filter } from '../../breadcrumb/filter';
import { takeUntil } from 'rxjs/operators';
import { UriUtils } from '../../shared/uriutils';

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
  retrievedFacets;
  relevance = 0.2;
  totalInstances = 0;
  filteredInstances;
  page = 1;
  pageSize = 10;
  datasetClass: Class = new Class();
  resources: Description[] = [];
  anonResources: Map<string, Description> = new Map<string, Description>();
  labels: Map<string, string> = new Map<string, string>();

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
    this.filteredInstances = undefined;
    this.classService.getInstancesCount(datasetId, classId, filters).subscribe(
      count => {
        this.filteredInstances = count;
        this.loadInstances(datasetId, classId, filters, this.page);
      });
  }

  loadInstances(datasetId: string, classId: string, filters: Filter[], page: number) {
    forkJoin([
      this.classService.getInstances(datasetId, classId, filters, page, this.pageSize),
      this.classService.getInstancesLabels(datasetId, classId, filters, page, this.pageSize) ])
      .subscribe(
        ([instances, labels]) => {
          if (labels['@graph']) {
            labels['@graph']
              .map(instance => Object.entries(instance)
                .forEach(([key, value]) => {
                  if (key.includes('label')) {
                    this.labels.set(UriUtils.expandUri(instance['@id'], labels['@context']), <string>value);
                  }
                }));
          }
          if (instances['@graph']) {
            instances['@graph']
              .filter(instance => (<string>instance['@id']).startsWith('_:'))
              .map(instance => this.anonResources.set(instance['@id'],
                new Description(instance, instances['@context'], this.labels)));
            instances['@graph']
              .map(instance => Object.entries(instance)
                .forEach(([key, value]) => {
                  if (key.includes('label')) {
                    this.labels.set(UriUtils.expandUri(instance['@id'], instances['@context']), <string>value);
                  }
                }));
            this.resources = instances['@graph']
              .filter(instance => instance['@type'] &&
                Description.isOfType(instance['@type'], this.datasetClass.uri, instances['@context']) )
              .map(instance => new Description(instance, instances['@context'], this.labels));
          } else if (instances['@type']) {
            this.resources = [new Description(instances, instances['@context'], this.labels)];
          } else {
            this.resources = [];
          }
        });
  }

  goToPage(page: number) {
    this.loadInstances(this.datasetId, this.classId, this.breadcrumbService.filters, page);
  }

  loadAllFacets() {
    this.refreshFacets(0);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.breadcrumbService.clearFilter();
  }
}
