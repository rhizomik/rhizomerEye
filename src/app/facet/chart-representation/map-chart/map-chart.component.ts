import {Component, OnInit, AfterViewInit, OnChanges, Input} from '@angular/core';
import * as L from 'leaflet';
import { MapMarkerService } from './map-marker.service';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map-chart',
  templateUrl: './map-chart.component.html',
  styleUrls: ['./map-chart.component.css']
})
export class MapChartComponent implements OnInit, AfterViewInit, OnChanges {

  private map;

  @Input()
  myPoints = []

  constructor(private mapMarkerService: MapMarkerService) {

  }

  ngOnInit(): void {
  }

  ngOnChanges() {
  }

  ngAfterViewInit(): void {
    this.initMap(this.myPoints[0]);
    this.mapMarkerService.makeCapitalMarkers(this.map, this.myPoints);

  }

  private initMap(firstPoint): void {
    const lat = firstPoint[0]
    const long = firstPoint[1]
    console.log("map lat long: ", lat, long)
    this.map = L.map('map', {
      center: [lat, long],
      zoom: 3
    });

    const tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community</a>'
    });

    tiles.addTo(this.map);

  }
}
