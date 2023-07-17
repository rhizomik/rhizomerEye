import {Component, HostListener, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Description} from '../../description/description';
import {ChartType} from 'angular-google-charts';

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
  @Input()
  defaultMap = false


  tag_chart: string;

  display = "none";

  numerical_values: string[];
  correlation_fields: string[] = [];
  is_correlation_chart: boolean = false;

  dataframe: any[][][];
  column_index: string[];
  layer: number = 0;

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
  mapType = false;

  //to check if data is being processed
  dataProcessed = false;

  constructor() {
    this.onResize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
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
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.defaultMap) {
      // esto deberia ser para generar la vista view on map automaticamente
      this.type = ChartType.Map
      this.mapType = true
      this.createMapChart()
    }

    if (this.is_correlation_chart) {
      this.createCorrelationTable();
    } else if (this.timelineType) {
      this.createTimelineChart()
    } else if (this.type == ChartType.Map) {
      this.createMapChart()
    } else {
      this.createCharts();
    }
  }

  createCharts(): void {
    this.chartData.columnNames = []
    this.chartData.data = []
    this.numerical_values = this.getFirstColumn(this.numerical_values_input);
    this.deleteAxisFromNumericals();
    this.createDataFrame();
  }

  switchAxes() {
    const aux = this.rows;
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
    if (this.timelineType || this.mapType) {
      this.timelineType = false
      this.mapType = false
      this.createCharts()
    }
  }

  barChart() {
    this.type = ChartType.Bar;

    if (this.timelineType) {
      this.timelineType = false
      this.createCharts()
    } else if(this.mapType) {
      this.mapType = false
      this.createCharts()
    }
  }

  lineChart() {
    this.type = ChartType.Line;
    if (this.timelineType) {
      this.timelineType = false
      this.createCharts()
    } else if(this.mapType) {
      this.mapType = false
      this.createCharts()
    }
  }

  pieChart() {
    this.type = ChartType.PieChart;
    if (this.timelineType) {
      this.timelineType = false
      this.createCharts()
    } else if(this.mapType) {
      this.mapType = false
      this.createCharts()
    }
  }

  mapChart() {
    this.mapType = true;
    this.type = ChartType.Map;
    if(this.timelineType) {
      this.timelineType = false
    }
    this.createMapChart()
  }

  createMapChart() {
    const points = []
    let propertyContent = ""
    let showUri = false;
    for (let i = 0; i < this.resources.length; i++) {
      const property = this.resources[i].properties
      const [lat, long] = this.findCoords(property)
      if(this.numerical_values_input.length == 0) {
        //no hay numericos, pondremos la uri
        showUri = true;
        propertyContent = this.resources[i]["@id"]
      } else {
        propertyContent = this.findContent(property)
      }
      const newPoint = [lat, long, propertyContent, showUri]
      points.push(newPoint)
    }
    this.chartData.data = points
  }

  findCoords(property) {
    const type = this.possiblePoints[0][1]
    for (let i = 0; i < property.length; i++) {
      if (property[i].label.includes(type)) {
        const coords: string = property[i].values[1].value
        const [long, lat] = coords.slice(6, -1).split(" ")
        if (coords.includes("https")) {
          const coords = property[i].values[0].value
          const [long, lat] = coords.slice(6, -1).split(" ")
          return [Number(lat), Number(long)]
        }
        return [Number(lat), Number(long)]
      }
    }


  }

  timelineChart() {
    this.type = ChartType.Timeline;
    this.mapType = false
    if(this.mapType) {
      this.mapType = false
    }
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
      const [propertyFrom, propertyTo] = this.customFromAndTo(tmpPropertyFrom)
      const propertyContent = this.findContent(property)
      const newDate = [propertyName, propertyContent, propertyFrom, propertyTo]
      if (this.existUndefined(propertyName, propertyContent, propertyFrom, propertyTo)) {
        continue
      }
      dates.push(newDate)
    }
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
    for (let i = 0; i < property.length; i++) {
      if (property[i].label == axe) {
        return property[i].values[0].value
      }
    }
  }

  findFrom(property) {
    const timeAxe = this.possibleTimes[0][1];
    for (let i = 0; i < property.length; i++) {
      if (property[i].label == timeAxe) {
        return property[i].values[0].value
      }
    }
  }

  customFromAndTo(propertyFrom) {
    //depending on the start date value, we find the appropriate end date
    const timeType = this.possibleTimes[0][0]
    const hasEnd = this.possibleTimes.length > 1
    switch (timeType) {
      case 'gYear': {
        if (hasEnd) {
          const tmpEnd = this.possibleTimes[1][1]
          return this.customizeYear(propertyFrom, tmpEnd)
        } else {
          const tmpEnd = Number(propertyFrom) + 1;
          return this.customizeYear(propertyFrom, tmpEnd)
        }
      }
      case 'dateTime': {
        if (hasEnd) {
          const tmpEnd = this.possibleTimes[1][1]
          return this.customizeDateTime(propertyFrom, tmpEnd)
        } else {
          return this.customizeEndDateTime(propertyFrom)
        }
      }
      case 'date': {
        if (hasEnd) {
          const tmpEnd = this.possibleTimes[1][1]
          return this.customizeDateTime(propertyFrom, tmpEnd)
        } else {
          return this.customizeEndDateTime(propertyFrom)
        }
      }
      case 'gMonth': {
        if (hasEnd) {
          const tmpEnd = this.possibleTimes[1][1]
          return this.customizeMonth(propertyFrom, tmpEnd)
        } else {
          return this.customizeEndMonth(propertyFrom)
        }
      }
      case 'gDay': {
        if (hasEnd) {
          const tmpEnd = this.possibleTimes[1][1]
          return this.customizeDay(propertyFrom, tmpEnd)
        } else {
          return this.customizeEndDay(propertyFrom)
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
    return [start, start]
  }

  customizeDateTime(startDate, endDate) {
    //datetime with specified end
    const start = new Date(startDate);
    const end = new Date(endDate);
    return [start, end]
  }

  customizeMonth(startMonth, endMonth) {
    let currentYear = new Date().getFullYear();
    const start = new Date(currentYear, startMonth, 1);
    let end = new Date(currentYear, endMonth, 1);

    if(endMonth < startMonth) {
      end = new Date(currentYear + 1, endMonth, 1);
    }

    return [start, end]
  }

  customizeEndMonth(startMonth) {
    //gMonth whether specified or not end
    let currentYear = new Date().getFullYear();
    let endMonth = startMonth + 1;
    if(startMonth == 11) {
      endMonth = 0
      currentYear += 1
    }
    const start = new Date(currentYear, startMonth, 1);
    const end = new Date(currentYear, endMonth, 1);
    return [start, end]
  }

  customizeDay(startDay, endDay) {
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    const start = new Date(currentYear, currentMonth, startDay);
    let end = new Date(currentYear, currentMonth, endDay);

    if(endDay < startDay) {
      if(currentMonth == 11) {
        //next year, next month
        end = new Date(currentYear + 1, 0, endDay);
      } else {
        //next month
        end = new Date(currentYear, currentMonth + 1, endDay);
      }
    }

    return [start, end]
  }

  customizeEndDay(startDay) {
    //gDay whether specified or not end
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let endDay = startDay + 1;

    const start = new Date(currentYear, currentMonth, startDay);
    let end = new Date(currentYear, currentMonth, endDay);

    if(endDay == this.getLastDay(currentYear, currentMonth)) {
      if(currentMonth == 11) {
        //next year, first month, first day
        end = new Date(currentYear + 1, 0, 1);
      } else {
        //current year, next month, first day
        end = new Date(currentYear, currentMonth + 1, 1);
      }
    }

    return [start, end]
  }

  getLastDay(year, month) {
    const tmpDate = new Date(year, month, 0)
    return tmpDate.getDate()
  }

  customizeYear(startYear, endYear) {
    //gYear whether specified or not end
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
    let to_return: any[] = [];
    for (let i = 0; i < array.length; i++) {
      if (this.rows != array[i][0] && this.columns != array[i][0]) {
        to_return = to_return.concat(array[i][0]);
      }
    }
    return to_return;
  }

  deleteAxisFromNumericals() {
    const array: string[][] = [];
    for (let i = 0; i < this.numerical_values_input.length; i++) {
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
    } else if(this.mapType) {
      this.createMapChart()
    } else {
      this.resizeColumns();
      this.resizeDataframe(this.dataframe[this.layer]);
    }
  }

  resizeDataframe(dataframe: any[][]): void {
    let void_columns = [];
    for (let i = 0; i < this.column_index.length; i++) {
      if (this.voidColumn(i, this.dataframe[this.layer])) {
        void_columns = void_columns.concat(i);
      }
    }
    this.chartData.data = this.deleteColumns(dataframe, void_columns);
  }

  deleteColumns(dataframe: any[][], col_to_delete: number[]): any[][] {
    const new_dataframe: any[][] = [];
    for (const row of dataframe) {
      new_dataframe.push(this.deleteFromRow(row, col_to_delete));
    }
    return new_dataframe;
  }

  deleteFromRow(row: any[], col_to_delete: number[]): any[] {
    let array = [];
    for (let i = 0; i < row.length; i++) {
      if (!col_to_delete.includes(i)) {
        array = array.concat(row[i]);
      }
    }
    return array;
  }

  resizeColumns(): void {
    this.column_index = this.createColumnIndex();
    let columns: string[] = [];
    for (let i = 0; i < this.column_index.length; i++) {
      if (!this.voidColumn(i, this.dataframe[this.layer])) {
        columns = columns.concat(this.column_index[i]);
      }
    }
    this.chartData.columnNames = columns;
  }

  voidColumn(index: number, dataframe: any[][]): boolean {
    for (let i = 0; i < dataframe.length; i++) {
      if (dataframe[i][index] != undefined) {
        return false;
      }
    }
    return true;
  }


  initialize_array(): any[][][] {
    const dataframe = Array(this.numerical_values.length);
    for (let i = 0; i < this.numerical_values.length; i++) {
      dataframe[i] = [];
    }
    return dataframe;
  }

  insert_into_df(dataframe: any[][][], attribute: string, row, column) {
    let layer_i = this.numerical_values.indexOf(attribute);
    let column_i = this.column_index.indexOf(column);
    if (!this.exists_row(dataframe[layer_i], row)) {
      this.add_row(dataframe[layer_i], row);
    }
    let row_i = this.get_row_index(dataframe[layer_i], row);
    return [layer_i, row_i, column_i];
  }

  get_row_index(dataframe: any[][], row) {
    for (let i = 0; i < dataframe.length; i++) {
      if (dataframe[i][0] == row) {
        return i;
      }
    }
    return -1;
  }

  exists_row(dataframe: any[][], row) {
    let exists = false;
    for (let i = 0; i < dataframe.length; i++) {
      if (dataframe[i][0] == row) {
        exists = true;
      }
    }
    return exists;
  }

  stringToNumber(string: string): number {
    if (string == ": " || string == undefined || isNaN(Number(string).valueOf())) {
      return undefined;
    }
    return Number(string).valueOf();
  }

  add_row(dataframe: any[][], row): void {
    let length = this.column_index.length;
    let row_to_add = [];
    for (let i = 0; i < length; i++) {
      row_to_add = row_to_add.concat(undefined);
    }
    row_to_add[0] = row
    dataframe.push(row_to_add);
  }

  createColumnIndex() {
    let index: string[];
    index = [];
    for (let i = 0; i < this.resources.length; i++) {
      const resource = JSON.parse(this.resources[i].asJsonLd());
      if (!index.includes(this.getValue(resource[this.columns]))) {
        index = index.concat(this.getValue(resource[this.columns]));
      }
    }
    index.sort();
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
    let name = "";
    for (let i = (uri.length - 1); i >= 0; i--) {
      if (uri[i] == "@" || uri[i] == "/" || uri[i] == "#") {
        break;
      }
      name = uri[i] + name;
    }
    return name;
  }

  createCorrelationTable() {
    const table: any[][] = [];
    this.column_index = this.createColumnIndexCorrelation();
    for (let i = 0; i < this.resources.length; i++) {
      const resource = JSON.parse(this.resources[i].asJsonLd());
      let column = this.getValue(resource[this.columns]);
      let row = this.getValue(resource[this.rows]);
      for (const attribute in resource) {
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
    let index: string[];
    index = [];
    for (let i = 0; i < this.resources.length; i++) {
      for (let j = 0; j < this.correlation_fields.length; j++) {
        const resource = JSON.parse(this.resources[i].asJsonLd());
        const columnName = this.getValue(resource[this.columns]) + "_" + this.extractFromURI(this.correlation_fields[j]);
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
