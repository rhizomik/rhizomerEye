import {Component, Input, OnInit, NgModule, OnChanges, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {Description} from '../../description/description';
import {GoogleChartsModule, ChartType, ChartEditorComponent, ChartBase} from 'angular-google-charts';
import {HostListener} from "@angular/core";
import {ViewChild} from '@angular/core';
import {ThisReceiver} from '@angular/compiler';
import {json} from 'd3';
import {toJSDate} from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-calendar';


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


  constructor() {
    this.onResize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    console.log(window.innerWidth);
    if (window.innerWidth < 770) {
      this.chartData.width = Math.floor(window.innerWidth * 0.9);
    } else {
      this.chartData.width = Math.floor(window.innerWidth * (800 / 1396));
    }
  }

  ngOnInit(): void {
    if ((this.rows !== '' || this.rows !== undefined)
      && (this.columns !== '' || this.columns !== undefined)) {
      this.createCharts();

      console.log("chart data", this.chartData)

      this.numerical_values_input[this.layer][1];
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.is_correlation_chart) {
      this.createCorrelationTable();
    } else {
      this.createCharts();
    }
  }

  createCharts(): void {
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
    if(this.timelineType) {
      this.timelineType = false
      this.createCharts()
    }

  }

  barChart() {
    this.type = ChartType.Bar;
    if(this.timelineType) {
      this.timelineType = false
      this.createCharts()
    }
  }

  lineChart() {
    this.type = ChartType.Line;
    if(this.timelineType) {
      this.timelineType = false
      this.createCharts()
    }
  }

  pieChart() {
    this.type = ChartType.PieChart;
    if(this.timelineType) {
      this.timelineType = false
      this.createCharts()
    }
  }

  mapChart() {
    this.type = ChartType.Map;
  }

  timelineChart() {

    this.type = ChartType.Timeline;
    this.createTimelineChart()
  }

  createTimelineChart() {
    this.timelineType = true;

    console.log()

    const dates = [];
    //dates.push(['Washington', new Date(1789, 3, 30), new Date(1797, 2, 4)])
    //console.log("trial: ", dates)

    const axe = this.column_index[0];
    //console.log("axe without time: ", axe)

    for(let i = 0; i < this.resources.length; i++) {
      const property = this.resources[i].properties;
      console.log("resource: ", property)
      console.log("time content: ", this.tag_chart)
      const propertyName = this.findName(property, axe);
      //console.log("propertyName: ", propertyName)
      const tmpPropertyFrom = this.findFrom(property);
      //console.log("propertyFrom: ", tmpPropertyFrom)
      const [propertyFrom, propertyTo] = this.findTo(tmpPropertyFrom)
      //console.log("start and end: ", propertyFrom, propertyTo)
      const propertyContent = this.findContent(property)
      const newDate = [propertyName, propertyContent, propertyFrom, propertyTo]
      if(this.existUndefined(propertyName, propertyContent, propertyFrom, propertyTo)) {
        continue
      }
      //const newDate = [propertyName, propertyFrom, propertyTo]
      console.log("vamos a añadir:\nName: ", propertyName, "\nContent: ", propertyContent, "\nFrom: ", propertyFrom, "\nTo: ", propertyTo)
      dates.push(newDate)
    }

    console.log("dates: ", dates)
    //this.chartData.columnNames = ["Name", "To", "From"]
    this.chartData.columnNames = ["Name", "Content", "To", "From"]
    this.chartData.data = dates

    /*
    this.chartData.columnNames = ["Name", "To", "From"]
    this.chartData.data = [
      ['Washington', new Date(1789, 3, 30), new Date(1797, 2, 4)],
      ['Adams', new Date(1797, 2, 4), new Date(1801, 2, 4)],
      ['Jefferson', new Date(1801, 2, 4), new Date(1809, 2, 4)]]
     */
  }

  existUndefined(name, content, from, to) {
    return name == undefined || content == undefined || from == undefined || to == undefined
  }

  findContent(property) {
    const contentName = this.tag_chart
    for(let i = 0; i < property.length; i++) {
      //console.log("buscamos ", contentName, "\nhemos encontrado: ", property[i].label, "\nEsta?: ", property[i].label.includes(contentName))
      if(property[i].label.includes(contentName)) {
        //console.log("content found: ", property[i].values[0].value)
        return property[i].values[0].value
      }
    }
  }

  findName(property, axe) {
    let name = '';
    for(let i = 0; i < property.length; i++) {
      if(property[i].label == axe) {
        name = property[i].values[0].value
      }
    }
    return name
  }

  findFrom(property) {
    const timeAxe = this.possibleTimes[0][1];
    let from = '';
    for(let i = 0; i < property.length; i++) {
      if(property[i].label == timeAxe) {
        from = property[i].values[0].value
      }
    }
    return from
  }

  findTo(propertyFrom) {
    //let's find the end time of the resource
    if(this.possibleTimes.length < 2) {
    //  console.log("onlyfrom: ", this.possibleTimes)
      return this.customFromAndTo(propertyFrom)
    } else {
      //console.log("only and from: ", this.possibleTimes)
      //todo: customize start and end date in datetime format
      return this.possibleTimes[1]
    }
  }

  customFromAndTo(propertyFrom) {
    //depending on the start date value, we find the appropriate end date
    //todo: asumimos que solo tenemos start date
    const timeType = this.possibleTimes[0][0]
    switch (timeType) {
      case 'gYear': {
        //if start date is gYear (and we don't have end date), we assume a hole year in datetime format
        var tmpEnd = Number(propertyFrom) + 1
      //  console.log("end: ", tmpEnd)
        return this.customizeYear(propertyFrom, tmpEnd)
      }
      //todo: completar con el tipo de wetcoin
      case 'timestamp': {
        break;
      }

      case 'dateTime': {
        break;
      }

      default: {
        break;
      }
    }
  }

  customizeYear(startYear, endYear) {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 0, 1);
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
    console.log("numerical values: ", this.numerical_values)
    this.column_index = this.createColumnIndex();
    console.log("colum_index", this.column_index)
    var dataframe: any[][][] = this.initialize_array();

    for (var i = 0; i < this.resources.length; i++) {
      var resource = JSON.parse(this.resources[i].asJsonLd());
      let column = this.getValue(resource[this.columns]);
      let row = this.getValue(resource[this.rows]);
      for (var attribute in resource) {
        if (this.numerical_values.includes(attribute)) {
          let [layer, row_i, column_i] = this.insert_into_df(dataframe, attribute, row, column);
          dataframe[layer][row_i][column_i] = this.stringToNumber(this.getValue(resource[attribute]));
          console.log("content: ", this.getValue(resource[attribute]))
        }
      }
    }
    this.dataframe = dataframe;
    console.log("dataframe: ", dataframe)
    console.log("layer: ", this.layer)
    console.log("chart data: ", this.chartData)
    console.log("chart content: ", this.numerical_values[this.layer])
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

    console.log("attribute, row, column: ", attribute, row, column)
    let layer_i = this.numerical_values.indexOf(attribute);
    let column_i = this.column_index.indexOf(column);
    //console.log("layer_i, column_i: ", layer_i, column_i)

    if (!this.exists_row(dataframe[layer_i], row)) {
      this.add_row(dataframe[layer_i], row);
    }
    let row_i = this.get_row_index(dataframe[layer_i], row);
    //console.log("row_i", row_i)
    console.log("layer_i, row_i, column_i", layer_i, row_i, column_i)

    return [layer_i, row_i, column_i];
  }

  get_row_index(dataframe: any[][], row) {
    var i = 0;
    for (i = 0; i < dataframe.length; i++) {
      if (dataframe[i][0] == row) {
        return i;
      }
    }
    return -1;
  }

  exists_row(dataframe: any[][], row) {
    var exists = false;
    for (var i = 0; i < dataframe.length; i++) {
      if (dataframe[i][0] == row) {
        exists = true;
      }
    }
    return exists;
  }

  stringToNumber(string: string): number {
    if (string == ": " || string == undefined || string == null) {
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
    row_to_add[0] = row;

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
