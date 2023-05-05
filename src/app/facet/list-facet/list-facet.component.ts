import {Component, Input, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { BreadcrumbService } from '../../breadcrumb/breadcrumb.service';
import { ClassService } from '../../class/class.service';
import { FacetService } from '../facet.service';
import { RangeService } from '../../range/range.service';
import { Class } from '../../class/class';
import { Facet } from '../facet';
import { Description } from '../../description/description';
import { Filter, Operator } from '../../breadcrumb/filter';
import { catchError, takeUntil } from 'rxjs/operators';
import { Value } from '../../description/value';
import { Range } from '../../range/range';
import { TranslateService } from '@ngx-translate/core';
import { RangeValue } from '../../range/rangeValue';
import { ChartRole } from './chartRoleClassifier';

import {ChartRepresentationComponent} from "../chart-representation/chart-representation.component";

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
  allResources: Description[] = [];
  anonResources: Map<string, Description> = new Map<string, Description>();
  labels: Map<string, Value> = new Map<string, Value>();
  showFacets: boolean;
  showCharts: boolean;
  showDetails = false;

  possibleRepresentation = false;
  //to show a message when entities are being processed
  dataProcessed = false;
  //to check if timeline may be available
  possibleTimes = [];

  //to check numerical values
  possibleNumericals = []
  tmpNumericals = []

  //to check if map may be available
  possiblePoints = 0;

  chartRepresentation = false;//false;
  possibleaxes: String[] = [];
  possiblevalues: String[] = [];
  selectedAxe1: String;
  selectedAxe2: String;
  uriAxe1: String;
  uriAxe2: String;
  selectedValue: String;
  display = "none";

  numericalInstancesInit = 1;
  numericalInstancesEnd  = 40;

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
    this.urlToMethod(this.route);
    this.refreshFacets(this.relevance, this.route.snapshot.queryParamMap);

  }

  urlToMethod(route: ActivatedRoute){
    const url = route.snapshot.url;
    const last_element = url[url.length - 1];
    if ('charts:' === last_element.toString().substring(0, 7)){
      this.chartRepresentation = true;
      const selectedAxes = last_element.toString().substring(7).split('&');
      this.uriAxe1 = selectedAxes[0];
      this.uriAxe2 = selectedAxes[1];
    }
  }

  refreshFacets(relevance: number, params: ParamMap) {
    if (params.keys.length) {
      relevance = 0;
    }
    this.facetService.getAllRelevant(this.datasetId, this.classId, relevance).subscribe({
      next: (facets: Facet[]) => {
        //comprobamos que haya fechas
        //todo: hacer lo mismo para los puntos
        this.checkDates(facets)
        this.checkNumericals(facets)
        console.log("numericals chekced: ", this.possibleNumericals)
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

  checkNumericals(facets: Facet[]) {
    //this.delay(500).then(r => )
    //todo: comprobar que tambien incluya datetime/timestamp
    var count = []
    for(var i = 0; i < facets.length; i++ ) {
      //console.log("me ha llegado: ", facets[i])
      if(facets[i].range.includes("int")) {
        this.possibleNumericals.push(['int', facets[i].uri])
        count.push([facets[i].uri, 'int'])
        //console.log("checkpoint int: ", this.possibleNumericals)
      } else if(facets[i].range.includes("decimal")) {
        //console.log("checkeamos y pusheamos: [decimal, ", facets[i].uri, "]")
        this.possibleNumericals.push(['decimal', facets[i].uri])
        //count.push([facets[i].uri, 'decimal'])
        //console.log("checkpoint decimal: ", this.possibleNumericals)
      }
    }
    //console.log("checkpoint: ", this.possibleNumericals)
    //console.log("checkpoint 3: ", count)
    this.tmpNumericals = count
    //console.log("suerte: ", this.tmpNumericals)
  }

  checkDates(facets: Facet[]) {
    //checks if facets contains dates
    for(let i = 0; i < facets.length; i++ ) {
      if(facets[i].range.includes("gYear")) {
        this.possibleTimes.push(['gYear', facets[i].uri])
      } else if(facets[i].range.includes("dateTime")) {
        console.log("hay datetime: ", facets[i].range)
        this.possibleTimes.push(['dateTime', facets[i].uri])
      }
    }
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
    this.isChartCompatible(this.datasetId, this.classId, filters, this.possibleTimes, this.possibleNumericals);
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  loadInstances(datasetId: string, classId: string, filters: Filter[], page: number) {
    (this.showDetails ?
      this.classService.getDetails(datasetId, classId, filters, page, this.pageSize) :
      this.classService.getInstances(datasetId, classId, filters, page, this.pageSize)).subscribe(
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

  isChartCompatible(datasetId: string, classId: string, filters: Filter[], possibleTimes: string[], possibleNumericals: string[]) {
    this.filteredInstances = undefined;
    this.resources = undefined;
    this.getDetails(datasetId, classId, filters, possibleTimes, possibleNumericals);
  }

  getDetails(datasetId: string, classId: string, filters: Filter[], possibleTimes, possibleNumericals){
    //We check if there is a numerical Observation/observation
    forkJoin([
        this.classService.getDetails(datasetId, classId, filters,
          this.numericalInstancesInit, this.numericalInstancesEnd).pipe(
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
            //var anonResources = Description.getAnonResources(instances, this.labels);
            var resources =  Description.getResourcesOfType(instances, this.datasetClass.uri, this.labels);
            this.possibleRepresentation = this.isChartRepresentable(resources);
            this.dataProcessed = true;

            this.allResources = resources;
            console.log("all resources", this.allResources)

            //this.checkAllResourcesForPossibleTimes(possibleTimes)
            this.checkAllResourcesForPossibleTimes2(possibleTimes)
            console.log("final check possibleTimes", this.possibleTimes)


            this.checkAllResourcesForPossibleNumericals(possibleNumericals)
            console.log("final check possibleNumericals", this.possibleNumericals)
            console.log("numericals canon: ", this.possiblevalues)

          } else if (instances['@type']) {
            var resources = [new Description(instances, instances['@context'], this.labels)];
          } else {
            resources = [];
          }
        });
  }

  checkAllResourcesForPossibleNumericals(possibeNumericals) {

    const tmpNumericals = [];

    for (let i = 0; i < possibeNumericals.length; i++) {
      for (let j = 0; j < this.allResources.length; j++) {
        for(let k = 0; k < this.allResources[j].properties.length; k++) {
          const label: string = this.allResources[j].properties[k].label;
          const uri = this.allResources[j].properties[k].uri;
          if(possibeNumericals[i][1] == uri) {
            console.log("es la correcta?: ", label, this.extractFromURI(label))
            tmpNumericals.push([uri, this.extractFromURI(label)])
            j = this.allResources.length
            break
          }
        }
      }
    }
    this.possibleNumericals = tmpNumericals
  }

  checkAllResourcesForPossibleTimes(possibleTimes) {
    for (let i = 0; i < possibleTimes.length; i++) {
      for (let j = 0; j < this.allResources[0].properties.length; j++) {
        const label: string = this.allResources[0].properties[j].label;
        const uri = this.allResources[0].properties[j].uri;
        if(possibleTimes[i][1] == uri) {
          //this.possibleTimes.push(['gYear', facets[i].uri])
          possibleTimes.pop()
          console.log("encontrado: ", possibleTimes)
          //const type = possibleTimes[i][0]
          //possibleTimes.push([type, label])
          possibleTimes.push(['gYear', label])
        }
      }
    }
    this.possibleTimes = possibleTimes
  }

  checkAllResourcesForPossibleTimes2(possibleTimes) {

    const tmpTimes = [];

    for (let i = 0; i < possibleTimes.length; i++) {
      for (let j = 0; j < this.allResources.length; j++) {
        console.log("resource: ", this.allResources[j].properties)
        for(let k = 0; k < this.allResources[j].properties.length; k++) {
          const label: string = this.allResources[j].properties[k].label;
          const uri = this.allResources[j].properties[k].uri;
          if(possibleTimes[i][1] == uri) {
            console.log("pusheamos: ", uri, label)
            console.log("es esto?: ", this.extractFromURI(uri), this.extractFromURI(label))
            console.log("tipo: ", possibleTimes[i][0])
            const type = possibleTimes[i][0]
            tmpTimes.push([type, label])
            j = this.allResources.length
            break
          }
        }
      }
    }
    console.log("tmpTimes: ", tmpTimes)
    this.possibleTimes = tmpTimes
  }

  createDataFrame() {
    if (this.selectedAxe1 == this.selectedAxe2 || this.selectedAxe1 == null || this.selectedAxe2 == null){
      alert("Not OK!")
    } else {
      this.chartRepresentation = true;
      const url = this.route.snapshot.url.toString().split(',');
      let params : ParamMap;
      this.breadcrumbService.filtersSelection.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        (filters: Filter[]) => params = Filter.toParamMap(filters));

      const new_url = url[0]+ '/' + url[1]+ '/' + url[2]
                      + '/charts:' + this.extractFromURI(this.selectedAxe1) + '&' + this.extractFromURI(this.selectedAxe2)

      this.router.navigate(
          [new_url],
          { queryParams: this.createQueryDict(params)});//{'rdf:employmentRate xsd:string' : '"75.4"'}});
    }
  }

  createQueryDict(params: ParamMap) {
    var dict = {};
    for (const key of params.keys){
      dict[key] = params.get(key);
    }
    return dict;
  }

  goToInstancesMode() {
    this.chartRepresentation = false;
    const url = this.route.snapshot.url.toString().split(',');
    let params : ParamMap;
    this.breadcrumbService.filtersSelection.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (filters: Filter[]) => params = Filter.toParamMap(filters));

    const new_url = url[0]+ '/' + url[1]+ '/' + url[2];
    this.router.navigate([new_url], { queryParams: this.createQueryDict(params)});
  }

  isChartRepresentable(descriptions: Description[]){
    //The conditions for being represented in a chart are: Having 2 axes and at least one property of numerical (or time) data.
    var axesClassification = {};
    var numericalClassification = {};
    var i = 0
    for (i; i < descriptions.length; i++){
      this.chartRoleClassifier(descriptions[i], axesClassification, numericalClassification);
    }
    this.possibleaxes   = this.detectAxes(i, axesClassification);
    //console.log("antes de entrar: ", numericalClassification)
    this.possiblevalues = this.detectNumericals(numericalClassification);
    //this.possibleTimes = this.detectTimeStamp(numericalClassification)

    this.urlAxes();
    console.log("possibleaxes: ", this.possibleaxes.length)
    console.log("possiblevalues: ", this.possiblevalues.length)
    console.log("possiblenumericals: ", this.possibleNumericals)
    console.log("isChartRepresentable: ", this.possibleaxes.length >= 2 && this.possiblevalues.length > 0)
    //return this.possibleaxes.length >= 2 && this.possiblevalues.length > 0//+ this.possibleTimes.length >= 1;
    return this.possibleaxes.length >= 2 && this.possibleNumericals.length > 0
  }

  detectTimeStamp(numericalClassification) {
    //TODO: useless
    var count = [];
    for(var attribute in numericalClassification) {
      if (numericalClassification[attribute] == ChartRole.TimeStamp){
        count.push(attribute)
      }
    }
    return count;
  }

  urlAxes() : void {
    for (let i = 0; i < this.possibleaxes.length; i++){
      const axe = this.possibleaxes[i][1].toString();
      const uri = this.possibleaxes[i][0].toString();
      if (this.uriAxe1 == axe){
        this.selectedAxe1 = uri;
      }
      if (this.uriAxe2 == axe){
        this.selectedAxe2 = uri;
      }
    }
  }

  detectNumericals(numericalClassification){
    //todo: maybe useless?
    //console.log("numericalClassification: ", numericalClassification)
    var returnNums = [];
    for (var attribute in numericalClassification){
      if (numericalClassification[attribute] == ChartRole.NumericalValue){
    //    console.log("pusheamos: ",attribute)
        returnNums.push([attribute, this.extractFromURI(attribute)]);
      }
    }
    //console.log("detectNumericals: ", returnNums)
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
    console.log("Extract from uri: ", uri, " --> ", name)
    return name;
  }

  //                  resources,  ............................, numericalClassification: {}
  chartRoleClassifier(json_input: Description, background_axes, background_numerical){
    //todo: maybe useless?
    var json_object = JSON.parse(json_input.asJsonLd());
    for (var attribute in json_object){
      if (!background_axes[attribute]){
        background_axes[attribute] = 1;
      } else if (background_axes[attribute]){
        background_axes[attribute] += 1;
      }

      //console.log(json_object[attribute], " es numerical: ", this.isNumerical(json_object[attribute]), "\nbackground: ", background_numerical[attribute])
      if(this.isNumerical(json_object[attribute]) && background_numerical[attribute] != ChartRole.Nothing) {
        //console.log("lo encontramos: ", background_numerical)
        background_numerical[attribute] = ChartRole.NumericalValue;
      } else if (!this.isNumerical(json_object[attribute])) {
        background_numerical[attribute] = ChartRole.Nothing;
      }
    }
  }

  //todo: useless, lo hago con las facetas al final
  isTimeStamp(string): Boolean {
    return string == "https://saref.etsi.org/core/hasTimestamp";
  }

  isNumerical(string){
    //todo maybe useless?
    const condition1 = !isNaN(Number(this.getValue(string)).valueOf()) && string != null
    const condition2 = this.getValue(string) == ": "
    //console.log("condition1: ", condition1, "\ncondition2: ", condition2)
    //console.log("mamonada de isNumerical: ", this.getValue(string), Number(this.getValue(string)), Number(this.getValue(string)).valueOf(), !isNaN(Number(this.getValue(string)).valueOf()), !isNaN(Number(this.getValue(string)).valueOf()) && string != null, this.getValue(string) == ": ")
    return (!isNaN(Number(this.getValue(string)).valueOf()) && string != null ) || this.getValue(string) == ": ";
  }

  changeChartPage(init: number, end: number){
    this.numericalInstancesInit = init;
    this.numericalInstancesEnd  = end;
    console.log("que reiniciamos possibletimes")
    this.possibleTimes = []
    this.ngOnInit();
  }

  getValue(json_object){
    if (json_object[0]["@label"]){
      return json_object[0]["@label"]
    }
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

  changeDetails() {
    this.showDetails = !this.showDetails;
    this.loadInstances(this.datasetId, this.classId, this.breadcrumbService.filters, this.page);
  }

  openModal() {
    this.display = "block";
  }
  onCloseHandled() {
    this.display = "none";
  }
}
