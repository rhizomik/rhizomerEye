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
import { Filter, Operator } from '../../breadcrumb/filter';
import { takeUntil } from 'rxjs/operators';
import { Value } from '../../description/value';
import { Range } from '../../range/range';
import { TranslateService } from '@ngx-translate/core';
import { RangeValue } from '../../range/rangeValue';

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
    public translate: TranslateService,
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
    this.facetService.getAllRelevant(this.datasetId, this.classId, relevance).subscribe({
      next: (facets: Facet[]) => {
        this.facets = facets.map(result => new Facet(result)).sort((a, b) =>
          a.getLabel(this.translate.currentLang).localeCompare(b.getLabel(this.translate.currentLang)));
        this.retrievedFacets = facets.length;
        this.loadFacetClass();
        forkJoin(this.facets.map(facet =>
            this.rangeService.getAll(this.datasetId, this.classId, facet.curie))).subscribe(
            facetsRanges => {
              facetsRanges.map((ranges, i) => this.facets[i].ranges = ranges.map(range => new Range(range)));
              this.loadFilters(params);
            }
        );
      },
      error: () => this.router.navigate(['..'], {relativeTo: this.route})
    });
  }

  loadFilters(params: ParamMap) {
    const paramFilters = params.keys.map(key => {
      const valueParam = params.get(key);
      const facetCurie = key.split(' ')[0] || null;
      const rangeCurie = key.split(' ')[1] || null;
      const facet = this.facets.find(f => f.curie === facetCurie);
      if (facet) {
        const range = facet.ranges.find(r => r.curie === rangeCurie);
        const operator = Filter.parseOperator(valueParam);
        const values = Filter.parseValues(valueParam, facet, operator);
        return new Filter(this.classId, facet, range, operator, values);
      } else if (facetCurie === 'rhz:contains') {
        return new Filter(this.classId, Facet.searchFacet, Range.searchRange, Operator.NONE,
          [new RangeValue({ value: valueParam }, Facet.searchFacet, [])]);
      } else {
        return null;
      }
    }).filter(filter => !!filter);
    paramFilters.forEach((filter: Filter) => {
      if (!filter.values.length) {
        filter.facet.selected = true;
      } else {
        filter.range.expanded = true;
      }
    });
    this.breadcrumbService.addFacetFilters(paramFilters);
    this.breadcrumbService.filtersSelection.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (filters: Filter[]) => this.refreshInstances(this.datasetId, this.classId, filters));
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
    this.resources = undefined;
    this.page = 1;
    window.scrollTo(0, 0);
    this.classService.getInstancesCount(datasetId, classId, filters).subscribe(
      count => {
        this.filteredInstances = count;
        this.loadInstances(datasetId, classId, filters, this.page);
      });
  }

  loadInstances(datasetId: string, classId: string, filters: Filter[], page: number) {
      this.classService.getInstances(datasetId, classId, filters, page, this.pageSize).subscribe(
        (instances) => {
          this.labels = new Map([...Description.getLabels(instances)]);
          if (instances['@graph']) {
            this.anonResources =
              Description.getAnonResources(instances, this.labels, this.translate.currentLang);
            this.resources =
              Description.getResourcesOfType(instances, this.datasetClass.uri, this.labels, this.translate.currentLang);
          } else if (instances['@type']) {
            this.resources =
              [new Description(instances, instances['@context'], this.labels, this.translate.currentLang)];
          } else {
            this.resources = [];
          }
          this.sortResource();
        });
  }

  goToPage(page: number) {
    window.scrollTo(0, 0);
    this.resources = undefined;
    this.loadInstances(this.datasetId, this.classId, this.breadcrumbService.filters, page);
  }

  loadAllFacets() {
    this.refreshFacets(0, Filter.toParamMap(this.breadcrumbService.filters));
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

  filterContains(searchText: HTMLInputElement) {
    this.breadcrumbService.addFacetFilterValue(this.classId, Facet.searchFacet, Range.searchRange,
      new RangeValue({ value: searchText.value }, Facet.searchFacet, []), Operator.NONE);
    searchText.value = '';
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.breadcrumbService.clearFilter();
  }
}
