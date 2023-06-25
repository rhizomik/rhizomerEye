import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as L from 'leaflet';
import {MapPopupService} from "./map-popup.service";

@Injectable({
  providedIn: 'root'
})
export class MapMarkerService {

  // capitals: string = '/assets/data/usa-capitals.geojson';
  constructor(private http: HttpClient,
              private mapPopupService: MapPopupService,
  ) {
  }

  makeCapitalMarkers(map: L.map): void {
    // this.http.get(this.capitals).subscribe((res: any) => {
    //   for (const c of res.features) {
    //     const lon = c.geometry.coordinates[0];
    //     const lat = c.geometry.coordinates[1];
    //     const marker = L.marker([lat, lon]);
    const marker = L.marker([71.0, 11.10])
    marker.bindPopup(this.mapPopupService.makeCapitalPopup("hello world"));

    marker.addTo(map);
  }

  // }
  // }
}
