import {Component, HostListener, Input, OnChanges, OnInit, SimpleChanges, AfterViewInit } from '@angular/core';
import {Description} from '../../description/description';
import {ChartType} from 'angular-google-charts';
import {MapChartComponent} from "./map-chart/map-chart.component";

// import * as L from 'leaflet';

@Component({
  selector: 'app-chart-representation',
  templateUrl: './chart-representation.component.html',
  styleUrls: ['./chart-representation.component.css'],
})

export class ChartRepresentationComponent implements OnInit, OnChanges {

  @Input()
  rows: string;
  @Input()
  columns: string;
  @Input()
  resources: Description[];
  @Input()
  numerical_values_input: string[][];

  @Input()
  possibleTimes = []
  @Input()
  possiblePoints = []


  tag_chart: string;

  display = "none";

  print: string;

  numerical_values: string[];
  correlation_fields: string[] = [];
  is_correlation_chart: boolean = false;

  dataframe: any[][][];
  column_index: string[];
  layer: number = 0;

  //Table, Line, BarChart ----> MapChart, TimelineChart
  type = ChartType.Table;
  legend: 'left';
  chartData = {
    data: [],
    columnNames: [],
    options: {},
    width: 800,
    height: 600
  };

  //to check if chart type has been changed to timeline
  timelineType = false;

  //to check if data is being processed
  dataProcessed = false;

  constructor() {
    this.onResize();
  }

  // private map;
  //
  // private initMap(): void {
  //   this.map = L.map('map', {
  //     center: [ 39.8282, -98.5795 ],
  //     zoom: 3
  //   });
  //   // const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //   const tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  //
  //     maxZoom: 18,
  //     minZoom: 3,
  //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community</a>'
  //   });
  //
  //   tiles.addTo(this.map);
  // }

  // ngAfterViewInit(): void {
  //   this.initMap();
  // }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth < 770) {
      this.chartData.width = Math.floor(window.innerWidth * 0.9);
    } else {
      this.chartData.width = Math.floor(window.innerWidth * (800 / 1396));
    }
  }

  ngOnInit(): void {
    // console.log("points: ", this.possiblePoints)
    if ((this.rows !== '' || this.rows !== undefined)
      && (this.columns !== '' || this.columns !== undefined)) {
      console.log("points: ", this.possiblePoints)
      this.createCharts();
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("points: ", this.possiblePoints)
    // this.numerical_values_input.push(["1", "2"])
    if (this.is_correlation_chart) {
      console.log("correlation chart")
      this.createCorrelationTable();
    } else if (this.timelineType) {
      this.createTimelineChart()
    } else if (this.type == ChartType.Map) {
      console.log("creando mapa")
    } else {
      console.log("else")
      this.createCharts();
    }
  }

  createCharts(): void {
    // console.log("createCharts: ", this.possiblePoints, this.numerical_values_input)
    console.log("type: ", this.type)

    this.numerical_values = this.getFirstColumn(this.numerical_values_input);
    this.deleteAxisFromNumericals();
    this.createDataFrame();
  }

  switchAxes() {
    var aux = this.rows;
    this.rows = this.columns;
    this.columns = aux;
    this.numerical_values = this.getFirstColumn(this.numerical_values_input);
    this.deleteAxisFromNumericals();

    if (this.is_correlation_chart) {
      this.createCorrelationTable();
    } else {
      this.createDataFrame();
    }
  }

  tableChart() {
    this.type = ChartType.Table;
    if (this.timelineType) {
      this.timelineType = false
      this.createCharts()
    }

  }

  barChart() {
    this.type = ChartType.Bar;
    if (this.timelineType) {
      this.timelineType = false
      this.createCharts()
    }
  }

  lineChart() {
    this.type = ChartType.Line;
    if (this.timelineType) {
      this.timelineType = false
      this.createCharts()
    }
  }

  pieChart() {
    this.type = ChartType.PieChart;
    if (this.timelineType) {
      this.timelineType = false
      this.createCharts()
    }
  }

  mapChart() {
    //todo
    this.type = ChartType.Map;
    this.createMapChart()
  }

  createMapChart() {
    const points = []
    for (let i = 0; i < this.resources.length; i++) {


      const property = this.resources[i].properties
      console.log("resource: ", property)
      const [lat, long] = this.findCoords(property)
      console.log("lat: ", lat)
      console.log("long: ", long)
      console.log("create map lat long: ", lat, long)
      console.log("numerical_values_input???: ", this.numerical_values_input)
      // const propertyContent = this.numerical_values_input[0][0]
      const propertyContent = "hello world"
      console.log("propertyContent: ", propertyContent)
      const newPoint = [lat, long, propertyContent]
      points.push(newPoint)
    }
    console.log("points: ", points)
    this.chartData.columnNames = ["Lat", "Long", "Content"]
    this.chartData.data = points
    // this.chartData.data = [
    //   [41.536341645995, 1.9227935884038, '1'],
    //   [41.551356292377, 1.8868243402613, '1'],
    // ]

    this.chartData.options = {
      showTooltip: true,
      showInfoWindow: true
    }

    console.log("mapa: ", this.chartData.data, this.type)


  }

  findCoords(property) {
    const type = this.possiblePoints[0][1]
    console.log("find coords type: ", type)
    for (let i = 0; i < property.length; i++) {
      if (property[i].label.includes(type)) {
        console.log("finding: ", property[i])
        const coords: string = property[i].values[1].value

        console.log("finding coords: ", coords, typeof coords)
        const [long, lat] = coords.slice(6, -1).split(" ")
        // if(!isNaN(lat) || !isNaN(long)) {
        if (coords.includes("https")) {
          const coords = property[i].values[0].value
          const [long, lat] = coords.slice(6, -1).split(" ")
          console.log("finding coords: 2", lat, long)
          return [Number(lat), Number(long)]
        }
        return [Number(lat), Number(long)]
      }
      //   //now timeline requires column #1 to be of type 'String'
      //   return property[i].values[0].value.toString()
      // }
    }


  }

  timelineChart() {
    this.type = ChartType.Timeline;
    this.createTimelineChart()
  }

  createTimelineChart() {
    this.timelineType = true;

    const dates = [];
    const axe = this.column_index[0];

    for (let i = 0; i < this.resources.length; i++) {
      const property = this.resources[i].properties;
      const propertyName = this.findName(property, axe);
      const tmpPropertyFrom = this.findFrom(property);
      // const [propertyFrom, propertyTo] = this.findTo(tmpPropertyFrom)
      const [propertyFrom, propertyTo] = this.customFromAndTo(tmpPropertyFrom)
      const propertyContent = this.findContent(property)
      const newDate = [propertyName, propertyContent, propertyFrom, propertyTo]
      if (this.existUndefined(propertyName, propertyContent, propertyFrom, propertyTo)) {
        continue
      }
      // console.log("newDate to push: ", newDate)
      // console.log("chartData: ", this.chartData)
      dates.push(newDate)
    }
    console.log("dates: ", dates)
    this.chartData.columnNames = ["Name", "Content", "To", "From"]
    this.chartData.data = dates

    this.chartData.options = {
      timeline: {colorByRowLabel: true}
    }

  }

  existUndefined(name, content, from, to) {
    return name == undefined || content == undefined || content == ': ' || from == undefined || to == undefined
  }

  findContent(property) {
    const contentName = this.tag_chart
    for (let i = 0; i < property.length; i++) {
      if (property[i].label.includes(contentName)) {
        //now timeline requires column #1 to be of type 'String'
        return property[i].values[0].value.toString()
      }
    }
  }

  findName(property, axe) {
    //todo: dejar la label original
    let name = '';
    for (let i = 0; i < property.length; i++) {
      if (property[i].label == axe) {
        name = property[i].values[0].value
        //break o return
      }
    }
    // return this.extractFromURI(name)
    return name
  }

  findFrom(property) {
    const timeAxe = this.possibleTimes[0][1];
    let from = '';
    for (let i = 0; i < property.length; i++) {
      if (property[i].label == timeAxe) {
        from = property[i].values[0].value
        //break o return
      }
    }
    return from
  }

  findTo(propertyFrom) {
    //todo: useless, pasaremos directamente a customizeFromAndTo
    //let's find the end time of the resource
    if (this.possibleTimes.length < 2) {
      return this.customFromAndTo(propertyFrom)
    } else {
      return this.possibleTimes[1]
    }
  }

  customFromAndTo(propertyFrom) {
    //depending on the start date value, we find the appropriate end date
    const timeType = this.possibleTimes[0][0]
    const hasEnd = this.possibleTimes.length > 1
    switch (timeType) {
      case 'gYear': {
        if (hasEnd) {
          //todo: deberia hacer como en findFrom, no puedo coger para todas las entidades la primera fecha
          //mentira, ya esta bien, en caso de tener fecha de fin, será otra entrada en possibletimes
          //eso si, estamos asumiendo que esas 2 nos vendrán en orden y serán del mismo tipo
          const tmpEnd = this.possibleTimes[1][1]
          return this.customizeYear(propertyFrom, tmpEnd)
        } else {
          const tmpEnd = Number(propertyFrom) + 1;
          return this.customizeYear(propertyFrom, tmpEnd)
        }
      }
      case 'dateTime': {
        if (hasEnd) {
          //todo: lo mismo aquí
          const tmpEnd = this.possibleTimes[1][1]
          return this.customizeDateTime(propertyFrom, tmpEnd)
        } else {
          return this.customizeEndDateTime(propertyFrom)
        }
      }
      case 'gMonth': {
        if (hasEnd) {
          //todo: lo mismo aqui
          const tmpEnd = this.possibleTimes[1][1]
          return this.customizeMonth(propertyFrom, tmpEnd)
        } else {
          const tmpEnd = Number(propertyFrom) + 1;
          return this.customizeMonth(propertyFrom, tmpEnd)
        }
      }
      case 'gDay': {
        if (hasEnd) {
          //todo: lo mismo aqui
          const tmpEnd = this.possibleTimes[1][1]
          return this.customizeDay(propertyFrom, tmpEnd)
        } else {
          const tmpEnd = Number(propertyFrom) + 1;
          return this.customizeDay(propertyFrom, tmpEnd)
        }
      }
      default: {
        break;
      }
    }
  }

  customizeEndDateTime(startDate) {
    //datetime with no specified end
    const start = new Date(startDate)

    const endYear = start.getFullYear() + 1
    const endMonth = start.getMonth()
    const endDay = start.getDate()
    const endHour = start.getHours()
    const endMinute = start.getMinutes()
    const endSecond = start.getSeconds()
    const end = new Date(endYear, endMonth, endDay, endHour, endMinute, endSecond)
    return [start, start]
    // return [start, end]
  }

  customizeDateTime(startDate, endDate) {
    //datetime with specified end
    const start = new Date(startDate);
    const end = new Date(endDate);

    // return [start, start]
    return [start, end]
  }

  customizeMonth(startMonth, endMonth) {
    //gMonth whether specified or not end
    const currentYear = new Date().getFullYear();
    const start = new Date(currentYear, startMonth, 1);
    const end = new Date(currentYear, endMonth, 1);
    return [start, end]
  }

  customizeDay(startDay, endDay) {
    //gDay whether specified or not end
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const start = new Date(currentYear, currentMonth, startDay);
    const end = new Date(currentYear, currentMonth, endDay);
    return [start, end]
  }

  customizeYear(startYear, endYear) {
    //gYear whether specified or not end
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 0, 1);
    // return [start, start]
    return [start, end]
  }


  openModal() {
    this.correlation_fields = [];
    this.display = "block";
  }

  onCloseHandled() {
    this.display = "none";
  }

  getFirstColumn(array: any[][]) {
    //todo maybe useless?
    var to_return: any[] = [];
    for (var i = 0; i < array.length; i++) {
      if (this.rows != array[i][0] && this.columns != array[i][0]) {
        to_return = to_return.concat(array[i][0]);
      }
    }
    return to_return;
  }

  deleteAxisFromNumericals() {
    var array: string[][] = [];
    for (var i = 0; i < this.numerical_values_input.length; i++) {
      if (this.numerical_values_input[i][0] != this.columns && this.numerical_values_input[i][0] != this.rows) {
        array.push(this.numerical_values_input[i])
      }
    }
    this.numerical_values_input = array;
  }

  createDataFrame() {
    this.column_index = this.createColumnIndex();
    const dataframe: any[][][] = this.initialize_array();

    for (let i = 0; i < this.resources.length; i++) {
      const resource = JSON.parse(this.resources[i].asJsonLd());
      let column = this.getValue(resource[this.columns]);
      let row = this.getValue(resource[this.rows]);
      for (const attribute in resource) {
        if (this.numerical_values.includes(attribute)) {
          let [layer, row_i, column_i] = this.insert_into_df(dataframe, attribute, row, column);
          dataframe[layer][row_i][column_i] = this.stringToNumber(this.getValue(resource[attribute]));
        }
      }
    }
    this.dataframe = dataframe;
    this.dataProcessed = true;
    this.switchData(this.numerical_values[this.layer]);
  }

  switchData(new_layer: string) {
    this.layer = this.numerical_values.indexOf(new_layer);
    this.tag_chart = this.numerical_values_input[this.layer][1]
    if (this.is_correlation_chart) {
      //This situation happens when the user comes from the correlation chart
      this.is_correlation_chart = false;

      this.createCharts();
    } else if (this.timelineType) {
      this.createTimelineChart()
    } else {
      this.resizeColumns();
      this.resizeDataframe(this.dataframe[this.layer]);
    }
  }

  resizeDataframe(dataframe: any[][]): void {
    var void_columns = [];
    for (var i = 0; i < this.column_index.length; i++) {
      if (this.voidColumn(i, this.dataframe[this.layer])) {
        void_columns = void_columns.concat(i);
      }
    }
    this.chartData.data = this.deleteColumns(dataframe, void_columns);
  }

  deleteColumns(dataframe: any[][], col_to_delete: number[]): any[][] {
    var new_dataframe: any[][] = [];
    for (var row of dataframe) {
      new_dataframe.push(this.deleteFromRow(row, col_to_delete));
    }
    return new_dataframe;
  }

  deleteFromRow(row: any[], col_to_delete: number[]): any[] {
    var array = [];
    for (var i = 0; i < row.length; i++) {
      if (!col_to_delete.includes(i)) {
        array = array.concat(row[i]);
      }
    }
    return array;
  }

  resizeColumns(): void {
    this.column_index = this.createColumnIndex();
    var columns: string[] = [];
    for (var i = 0; i < this.column_index.length; i++) {
      if (!this.voidColumn(i, this.dataframe[this.layer])) {
        columns = columns.concat(this.column_index[i]);
      }
    }
    this.chartData.columnNames = columns;
  }

  voidColumn(index: number, dataframe: any[][]): boolean {
    for (var i = 0; i < dataframe.length; i++) {
      if (dataframe[i][index] != undefined) {
        return false;
      }
    }
    return true;
  }


  initialize_array(): any[][][] {
    var dataframe = Array(this.numerical_values.length);
    for (var i = 0; i < this.numerical_values.length; i++) {
      dataframe[i] = [];
    }
    return dataframe;
  }

  insert_into_df(dataframe: any[][][], attribute: string, row, column) {

    //console.log("attribute, row, column: ", attribute, row, column)
    let layer_i = this.numerical_values.indexOf(attribute);
    let column_i = this.column_index.indexOf(column);
    //console.log("layer_i, column_i: ", layer_i, column_i)

    if (!this.exists_row(dataframe[layer_i], row)) {
      // console.log("vamos a tocar: ", dataframe, layer_i, row)
      this.add_row(dataframe[layer_i], row);
    }
    let row_i = this.get_row_index(dataframe[layer_i], row);
    //console.log("row_i", row_i)
    //console.log("layer_i, row_i, column_i", layer_i, row_i, column_i)

    return [layer_i, row_i, column_i];
  }

  get_row_index(dataframe: any[][], row) {
    for (let i = 0; i < dataframe.length; i++) {
      // if (dataframe[i][0] == row.split("/").pop()) {
      if (dataframe[i][0] == row) {
        return i;
      }
    }
    return -1;
  }

  exists_row(dataframe: any[][], row) {
    var exists = false;
    for (var i = 0; i < dataframe.length; i++) {
      //label modificada
      // if (dataframe[i][0] == row.split("/").pop()) {
      if (dataframe[i][0] == row) {
        exists = true;
      }
    }
    return exists;
  }

  stringToNumber(string: string): number {
    // console.log("NaN: ", string)
    if (string == ": " || string == undefined || isNaN(Number(string).valueOf())) {
      return undefined;
    }
    return Number(string).valueOf();
  }

  add_row(dataframe: any[][], row): void {
    let length = this.column_index.length;
    var row_to_add = [];
    for (var i = 0; i < length; i++) {
      row_to_add = row_to_add.concat(undefined);
    }
    //label modificada
    // const parsedRow = row.split("/").pop()

    // row_to_add[0] = parsedRow//row;
    row_to_add[0] = row
    // console.log("label original: ", row)
    // console.log("añadimos al dataframe: ", parsedRow, row_to_add)
    dataframe.push(row_to_add);
  }

  createColumnIndex() {
    var index: string[];
    index = [];
    for (var i = 0; i < this.resources.length; i++) {
      var resource = JSON.parse(this.resources[i].asJsonLd());
      if (!index.includes(this.getValue(resource[this.columns]))) {
        index = index.concat(this.getValue(resource[this.columns]));
        //console.log("añadimos: ", this.getValue(resource[this.columns]))
      }
    }
    index.sort();
    //console.log("rows: ", this.rows, "columns: ", this.columns, "rows+columnIndex: ", [this.extractFromURI(this.rows)].concat(index))
    return [this.extractFromURI(this.rows)].concat(index);
  }

  getValue(json_object) {
    if (json_object[0]["label"]) {
      return json_object[0]["label"];
    }
    if (json_object[0]["@value"]) {
      return json_object[0]["@value"];
    }
    if (json_object[0]["@id"]) {
      return json_object[0]["@id"];
    }
    if (json_object[0]) {
      return json_object[0];
    }
    return json_object;
  }

  extractFromURI(uri: string): string {
    var name = "";
    for (var i = (uri.length - 1); i >= 0; i--) {
      if (uri[i] == "@" || uri[i] == "/" || uri[i] == "#") {
        break;
      }
      name = uri[i] + name;
    }
    // console.log("Chart extract from uri: ", uri, name)
    return name;
  }

  createCorrelationTable() {
    var table: any[][] = [];
    this.column_index = this.createColumnIndexCorrelation();
    for (var i = 0; i < this.resources.length; i++) {
      var resource = JSON.parse(this.resources[i].asJsonLd());
      let column = this.getValue(resource[this.columns]);
      let row = this.getValue(resource[this.rows]);
      for (var attribute in resource) {
        if (this.correlation_fields.includes(attribute)) {
          let attribute_column = column + "_" + this.extractFromURI(attribute);
          let [row_i, column_i] = this.insert_into_correlation_table(table, attribute, row, attribute_column);
          table[row_i][column_i] = this.stringToNumber(this.getValue(resource[attribute]));
        }
      }
    }
    this.chartData.columnNames = this.column_index;
    this.chartData.data = table;
    this.display = "none";
    this.tag_chart = "Multiple Facets"
    this.is_correlation_chart = true;
  }

  createColumnIndexCorrelation() {
    var index: string[];
    index = [];
    for (var i = 0; i < this.resources.length; i++) {
      for (var j = 0; j < this.correlation_fields.length; j++) {
        var resource = JSON.parse(this.resources[i].asJsonLd());
        var columnName = this.getValue(resource[this.columns]) + "_" + this.extractFromURI(this.correlation_fields[j]);
        if (!index.includes(columnName)) {
          index = index.concat(columnName);
        }
      }
    }
    index.sort();
    return [this.extractFromURI(this.rows)].concat(index);
  }

  correlationFacets(element) {
    this.correlation_fields.push(element);
  }

  insert_into_correlation_table(table: any[][], attribute: string, row, column) {

    let column_i = this.column_index.indexOf(column);

    if (!this.exists_row(table, row)) {
      this.add_row(table, row);
    }
    let row_i = this.get_row_index(table, row);

    return [row_i, column_i];
  }

}
