import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
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
import { Value } from '../../description/value';

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
  labels: Map<string, Value> = new Map<string, Value>();
  showFacets: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private classService: ClassService,
    private facetService: FacetService,
    private rangeService: RangeService) {
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did') || 'default';
    this.classId = this.route.snapshot.paramMap.get('cid');
    this.refreshFacets(this.relevance, this.route.snapshot.queryParamMap);
  }

  refreshFacets(relevance: number, params: ParamMap) {
    if (params.keys.length) {
      relevance = 0;
    }
    this.facetService.getAllRelevant(this.datasetId, this.classId, relevance).subscribe(
      (facets: Facet[]) => {
        this.facets = facets.sort((a, b) => a.label.localeCompare(b.label));
        this.retrievedFacets = facets.length;
        this.loadFacetClass();
        forkJoin(this.facets.map(facet =>
            this.rangeService.getAll(this.datasetId, this.classId, facet.curie))).subscribe(
            facetsRanges => {
              facetsRanges.map((ranges, i) => this.facets[i].ranges = ranges);
              const paramFilters = Filter.fromParam(this.classId, this.facets, params);
              paramFilters.forEach((filter: Filter) => {
                if (!filter.value) {
                  filter.facet.selected = true;
                } else {
                  filter.range.expanded = true;
                }
              });
              this.breadcrumbService.addFacetFilters(paramFilters);
              this.breadcrumbService.filtersSelection.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
                (filters: Filter[]) => this.refreshInstances(this.datasetId, this.classId, filters));
            }
        );
      });
  }

  loadFacetClass() {
    this.classService.get(this.datasetId, this.classId).subscribe(
      (datasetClass: Class) => {
        this.datasetClass = datasetClass;
        this.totalInstances = datasetClass.instanceCount;
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
          const linkedResourcesLabels: Map<string, Value> = Description.getLabels(labels);
          if (instances['@graph']) {
            this.labels = new Map([...linkedResourcesLabels, ...Description.getLabels(instances)]);
            this.anonResources = Description.getAnonResources(instances, this.labels);
            this.resources =  Description.getResourcesOfType(instances, this.datasetClass.uri, this.labels);
          } else if (instances['@type']) {
            this.resources = [new Description(instances, instances['@context'], this.labels)];
          } else {
            this.resources = [];
          }
          this.sortResource();
        });
  }

  goToPage(page: number) {
    this.loadInstances(this.datasetId, this.classId, this.breadcrumbService.filters, page);
  }

  loadAllFacets() {
    this.refreshFacets(0, this.route.snapshot.queryParamMap);
  }

  private sortResource() {
    this.resources.sort((a, b) => {
      if (a.label && b.label) {
        return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
      } else if (!a.label && b.label) {
        return -1;
      } else if (a.label && !b.label) {
        return 1;
      } else {
        return a['@id'].localeCompare(b['@id']);
      }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.breadcrumbService.clearFilter();
  }
}
