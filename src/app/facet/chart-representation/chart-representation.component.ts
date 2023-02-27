import {Component, Input, OnInit, NgModule, OnChanges, SimpleChanges, Output, EventEmitter} from '@angular/core';
import { Description } from '../../description/description';
import { GoogleChartsModule, ChartType, ChartEditorComponent, ChartBase } from 'angular-google-charts';
import { HostListener } from "@angular/core";
import { ViewChild } from '@angular/core';
import { ThisReceiver } from '@angular/compiler';
import { json } from 'd3';
import { toJSDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-calendar';


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
  tag_chart : string;

  display = "none";

  print :string;

  numerical_values: string[];
  correlation_fields: string[] = [];
  is_correlation_chart: boolean = false;

  dataframe : any[][][];
  column_index: string[];
  layer : number = 0;

  //Table, Line, BarChart,
  type =  ChartType.Table;
  legend: 'left';
  chartData = {
    data: [],
    columnNames: [],
    options: {},
  width: 800,
  height: 600
  };

  //@Output() dataDisplayed1 = new EventEmitter(); //this.chartData.data.length;
  //@Output() dataDisplayed2 = 23//this.chartData.data.length;

  constructor () {
    this.onResize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    console.log(window.innerWidth);
    if (window.innerWidth < 770){
      this.chartData.width =  Math.floor(window.innerWidth * 0.9);
    } else {
      this.chartData.width =  Math.floor(window.innerWidth * (800/1396));
    }
}

  ngOnInit(): void {
    if ((this.rows !== '' ||  this.rows !== undefined)
      && (this.columns !== '' || this.columns !== undefined)){
      this.createCharts();
      this.numerical_values_input[this.layer][1];
    }

    //mandar el dato
    //this.dataDisplayed1.emit(this.chartData.data.length)
    //this.dataDisplayed2 = this.chartData.data.length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.is_correlation_chart){
      this.createCorrelationTable();
    } else {
      this.createCharts();
    }
  }

  createCharts() : void {
    this.numerical_values = this.getFirstColumn(this.numerical_values_input);
    this.deleteAxisFromNumericals();
    this.createDataFrame();
  }

  switchAxes(){
    var aux = this.rows;
    this.rows = this.columns;
    this.columns = aux;
    this.numerical_values = this.getFirstColumn(this.numerical_values_input);
    this.deleteAxisFromNumericals();

    if (this.is_correlation_chart){
      this.createCorrelationTable();
    } else {
      this.createDataFrame();
    }
  }

  tableChart(){
    this.type = ChartType.Table;
  }

  barChart(){
    this.type = ChartType.Bar;
  }

  lineChart(){
    this.type = ChartType.Line;
  }

  pieChart(){
    this.type = ChartType.PieChart;
  }

  openModal() {
    this.correlation_fields = [];
    this.display = "block";
  }
  onCloseHandled() {
    this.display = "none";
  }

  getFirstColumn(array: any[][]){
    var to_return : any[] = [];
    for (var i = 0; i < array.length; i++){
      if (this.rows != array[i][0] && this.columns != array[i][0]){
        to_return = to_return.concat(array[i][0]);
      }
    }
    return to_return;
  }

  deleteAxisFromNumericals(){
    var array: string[][] = [];
    for (var i = 0; i < this.numerical_values_input.length; i++){
      if (this.numerical_values_input[i][0] != this.columns && this.numerical_values_input[i][0] != this.rows){
        array.push(this.numerical_values_input[i])
      }
    }
    this.numerical_values_input = array;
  }

  createDataFrame() {
    this.column_index = this.createColumnIndex();
    var dataframe : any[][][] = this.initialize_array();
    for (var i = 0; i < this.resources.length; i++){
      var resource = JSON.parse(this.resources[i].asJsonLd());
      let column = this.getValue(resource[this.columns]);
      let row = this.getValue(resource[this.rows]);
      for (var attribute in resource){
        if (this.numerical_values.includes(attribute)){
          let [layer, row_i, column_i] = this.insert_into_df(dataframe, attribute, row, column);
          dataframe[layer][row_i][column_i] = this.stringToNumber(this.getValue(resource[attribute]));
        }
      }
    }
    this.dataframe = dataframe;
    this.switchData(this.numerical_values[this.layer]);
  }

  switchData(new_layer: string){
    this.layer = this.numerical_values.indexOf(new_layer);
    this.tag_chart = this.numerical_values_input[this.layer][1]
    if (this.is_correlation_chart) {
      //This situation happens when the user comes from the correlation chart
      this.is_correlation_chart = false;
      this.createCharts();
    } else {
      this.resizeColumns();
      this.resizeDataframe(this.dataframe[this.layer]);
    }
  }

  resizeDataframe(dataframe : any[][]) : void {
    var void_columns = [];
    for (var i = 0; i < this.column_index.length; i++){
      if (this.voidColumn(i, this.dataframe[this.layer])){
        void_columns = void_columns.concat(i);
      }
    }
    this.chartData.data = this.deleteColumns(dataframe, void_columns);
  }

  deleteColumns(dataframe: any[][], col_to_delete: number[]) : any[][] {
    var new_dataframe : any[][] = [];
    for (var row of dataframe){
      new_dataframe.push(this.deleteFromRow(row, col_to_delete));
    }

    console.log(new_dataframe);
    return new_dataframe;
  }

  deleteFromRow(row : any[], col_to_delete: number[]): any[] {
    var array = [];
    for (var i = 0; i < row.length; i++){
      if (!col_to_delete.includes(i)){
        array = array.concat(row[i]);
      }
    }
    return array;
  }

  resizeColumns() : void{
    this.column_index = this.createColumnIndex();
    var columns : string[] = [];
    for (var i = 0; i < this.column_index.length; i++){
      if (!this.voidColumn(i, this.dataframe[this.layer])){
        columns = columns.concat(this.column_index[i]);
      }
    }
    this.chartData.columnNames = columns;
  }

  voidColumn(index : number, dataframe: any[][]): boolean {
    for (var i = 0; i < dataframe.length; i++){
      if (dataframe[i][index] != undefined){
        return false;
      }
    }
    return true;
  }


  initialize_array() : any[][][] {
    var dataframe = Array(this.numerical_values.length);
    for (var i = 0; i < this.numerical_values.length; i++){
      dataframe[i] = [];
    }
    return dataframe;
  }

  insert_into_df(dataframe : any[][][], attribute: string, row, column) {

    let layer_i  = this.numerical_values.indexOf(attribute);
    let column_i = this.column_index.indexOf(column);

    if (!this.exists_row(dataframe[layer_i], row)){
      this.add_row(dataframe[layer_i], row);
    }
    let row_i = this.get_row_index(dataframe[layer_i], row);

    return [layer_i, row_i, column_i];
  }

  get_row_index(dataframe: any[][], row){
    var i = 0;
    for (i = 0; i < dataframe.length; i++){
      if (dataframe[i][0] == row){
        return i;
      }
    }
    return -1;
  }

  exists_row(dataframe: any[][], row){
    var exists = false;
    for (var i = 0; i < dataframe.length; i++){
      if (dataframe[i][0] == row){
        exists = true;
      }
    }
    return exists;
  }

  stringToNumber(string: string) : number {
    if (string == ": " || string == undefined || string == null){
      return undefined;
    }
    return Number(string).valueOf();
  }

  add_row(dataframe : any[][], row) : void {
    let length = this.column_index.length;
    var row_to_add = [];
    for (var i = 0; i < length; i++){
      row_to_add = row_to_add.concat(undefined);
    }
    row_to_add[0] = row;

    dataframe.push(row_to_add);
  }

  createColumnIndex() {
    var index : string[];
    index = [];
    for (var i = 0; i < this.resources.length; i++){
      var resource = JSON.parse(this.resources[i].asJsonLd());
      if (!index.includes(this.getValue(resource[this.columns]))){
        index = index.concat(this.getValue(resource[this.columns]));
      }
    }
    index.sort();
    return [this.extractFromURI(this.rows)].concat(index);
  }

  getValue(json_object){
    if (json_object[0]["label"]){
      return json_object[0]["label"];
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

  extractFromURI(uri: string) : string {
    var name = "";
    console.log(uri);
    for (var i = (uri.length - 1); i >= 0; i--){
      if (uri[i] == "@" || uri[i] == "/" || uri[i] == "#"){
        break;
      }
      name = uri[i] + name;
    }
    return name;
  }

  createCorrelationTable(){
    var table : any[][] = [];
    this.column_index = this.createColumnIndexCorrelation();
    for (var i = 0; i < this.resources.length; i++){
      var resource = JSON.parse(this.resources[i].asJsonLd());
      let column = this.getValue(resource[this.columns]);
      let row = this.getValue(resource[this.rows]);
      for (var attribute in resource){
        if (this.correlation_fields.includes(attribute)){
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
    var index : string[];
    index = [];
    for (var i = 0; i < this.resources.length; i++){
      for (var j = 0; j < this.correlation_fields.length; j++) {
        var resource = JSON.parse(this.resources[i].asJsonLd());
        var columnName = this.getValue(resource[this.columns]) + "_" + this.extractFromURI(this.correlation_fields[j]);
        if (!index.includes(columnName)){
          index = index.concat(columnName);
        }
      }
    }
    index.sort();
    return [this.extractFromURI(this.rows)].concat(index);
  }

  correlationFacets(element){
    this.correlation_fields.push(element);
  }

  insert_into_correlation_table(table : any[][], attribute: string, row, column) {

    let column_i = this.column_index.indexOf(column);

    if (!this.exists_row(table, row)){
      this.add_row(table, row);
    }
    let row_i = this.get_row_index(table, row);

    return [row_i, column_i];
  }

  }
