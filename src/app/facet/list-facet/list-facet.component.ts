import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { forkJoin, of, Subject, Subscriber, Subscription } from 'rxjs';
import { BreadcrumbService } from '../../breadcrumb/breadcrumb.service';
import { ClassService } from '../../class/class.service';
import { FacetService } from '../facet.service';
import { RangeService } from '../../range/range.service';
import { Class } from '../../class/class';
import { Facet } from '../facet';
import { Description } from '../../description/description';
import { Filter } from '../../breadcrumb/filter';
import { catchError, takeUntil } from 'rxjs/operators';
import { Value } from '../../description/value';
//---------------------------------------------------
import { environment } from '../../../environments/environment';
import { ChartRole } from './chartRoleClassifier';

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
  pageSize = 15;
  datasetClass: Class = new Class();
  resources: Description[] = [];
  allResources: Description[] = [];
  anonResources: Map<string, Description> = new Map<string, Description>();
  labels: Map<string, Value> = new Map<string, Value>();
  showFacets: boolean;
  showCharts: boolean;
  showDetails = false;
  chartRepresentation = false;
  possibleaxes: String[] = [];
  possiblevalues: String[] = [];
  selectedAxe1: String;
  selectedAxe2: String;
  selectedValue: String;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private classService: ClassService,
    private facetService: FacetService,
    private rangeService: RangeService,
    ) {
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
      }, () => this.router.navigate(['..'], {relativeTo: this.route}));
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
    this.isChartCompatible(this.datasetId, this.classId, filters);
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  loadInstances(datasetId: string, classId: string, filters: Filter[], page: number) {

    //Depending on what we want to show.
    if (this.showDetails){
      var api_result = this.classService.getDetails(datasetId, classId, filters, page, this.pageSize);
    }else {
      var api_result = this.classService.getInstances(datasetId, classId, filters, page, this.pageSize);
    }

    forkJoin([
      api_result.pipe(
        catchError(err => of({})),
      ),
      this.classService.getInstancesLabels(datasetId, classId, filters, page, this.pageSize).pipe(
        catchError(err => of({})),
      ) ])
      .subscribe(
        ([instances, labels]) => {
          const linkedResourcesLabels: Map<string, Value> = Description.getLabels(labels);
          this.labels = new Map([...linkedResourcesLabels, ...Description.getLabels(instances)]);
          if (instances['@graph']) {
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

  isChartCompatible(datasetId: string, classId: string, filters: Filter[]) {
    this.filteredInstances = undefined;
    this.resources = undefined;
    this.page = 1;
    this.classService.getInstancesCount(datasetId, classId, filters).subscribe(
      count => {
        this.filteredInstances = count;
        this.getDetails(datasetId, classId, filters);
      });
  }

  getDetails(datasetId: string, classId: string, filters: Filter[]){
    //We check if there is a numerical Observation/observation
    var observation = this.classId.includes("bservation");
    this.showCharts = observation;
    var numerical_data = false;
    if (observation){
      forkJoin([
          this.classService.getDetails(datasetId, classId, filters, 1, this.filteredInstances).pipe(
          catchError(err => of({})),
        ),
        this.classService.getInstancesLabels(datasetId, classId, filters, 1, this.pageSize).pipe(
          catchError(err => of({})),
        ) ])
        .subscribe(
          ([instances, labels]) => {
            const linkedResourcesLabels: Map<string, Value> = Description.getLabels(labels);
            labels = new Map([...linkedResourcesLabels, ...Description.getLabels(instances)]);
            if (instances['@graph']) {
              var anonResources = Description.getAnonResources(instances, this.labels);
              var resources =  Description.getResourcesOfType(instances, this.datasetClass.uri, this.labels);
              this.isChartRepresentable(resources);
              this.allResources = resources;
            } else if (instances['@type']) {
              var resources = [new Description(instances, instances['@context'], this.labels)];
            } else {
              resources = [];
            }
          });
    }
    return numerical_data;
  }

  createDataFrame() {
    if (this.selectedAxe1 == this.selectedAxe2 || this.selectedAxe1 == null || this.selectedAxe2 == null){
      alert("Not OK!")
    } else {
      this.chartRepresentation = true; 
    }
  }

  goToInstancesMode() {
    this.chartRepresentation = false;
  }

  isChartRepresentable(descriptions: Description[]){
    //The conditions for being represented in a chart are: Having 2 axes and at least one property of numerical data.
    var axesClassification = {};
    var numericalClassification = {};
    var i = 0
    for (i; i < descriptions.length; i++){
      this.chartRoleClassifier(descriptions[i], axesClassification, numericalClassification);
    }

    this.possibleaxes   = this.detectAxes(i, axesClassification);
    this.possiblevalues = this.detectNumericals(numericalClassification);

  }

  detectNumericals(numericalClassification){
    var returnNums = [];
    for (var attribute in numericalClassification){
      if (numericalClassification[attribute] == ChartRole.NumericalValue){
        returnNums.push([attribute, this.extractFromURI(attribute)]);
      }
    }
    return returnNums;
  }

  detectAxes(top, axesClassification){
    var returnAxes = [];
    for (var attribute in axesClassification){
      if (axesClassification[attribute] == top){
        returnAxes.push([attribute, this.extractFromURI(attribute)]);
      }
    }
    return returnAxes;
  }

  extractFromURI(uri){
    var name = "";
    for (var i = (uri.length - 1); i >= 0; i--){
      if (uri[i] == "@" || uri[i] == "/" || uri[i] == "#"){
        break;
      }
      name = uri[i] + name;
    }
    return name;
  }

  chartRoleClassifier(json_input, background_axes, background_numerical){
    var json_object = JSON.parse(json_input.asJsonLd()); 
    for (var attribute in json_object){
      if (!background_axes[attribute]){
        background_axes[attribute] = 1;
      } else if (background_axes[attribute]){
        background_axes[attribute] += 1;
      }
      if(this.isNumerical(json_object[attribute]) && background_numerical[attribute] != ChartRole.Nothing){
        background_numerical[attribute] = ChartRole.NumericalValue;
      } else if (!this.isNumerical(json_object[attribute])){
        background_numerical[attribute] = ChartRole.Nothing;
      }
    }

  }

  isNumerical(string){
    return (!isNaN(Number(this.getValue(string)).valueOf()) && string != null ) || this.getValue(string) == ": ";
  }

  getValue(json_object){
    if (json_object[0]["@value"]){
      return json_object[0]["@value"];
    }
    if (json_object[0]["@id"]){
      return json_object[0]["@id"];
    }
    if (json_object[0]){
      return json_object[0];
    }
    return json_object;
  }

  isGeoCompatible(){
      //return this.isChartCompatible() 
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



  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.breadcrumbService.clearFilter();
  }


  changeDetails() {
    this.showDetails = !this.showDetails;
    if (this.showDetails){
      this.pageSize = 10;
    }else{
      this.pageSize = 40;
    }
    this.loadInstances(this.datasetId, this.classId, this.breadcrumbService.filters, this.page);
  }
}
