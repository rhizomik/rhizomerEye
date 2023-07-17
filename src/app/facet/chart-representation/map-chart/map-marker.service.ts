import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as L from 'leaflet';
import {MapPopupService} from "./map-popup.service";

@Injectable({
  providedIn: 'root'
})


export class MapMarkerService {
  constructor(private http: HttpClient,
              private mapPopupService: MapPopupService,
  ) {
  }

  makeCapitalMarkers(map: L.map, points): void {
    for (const point of points) {
      const lat = point[0]
      const lon = point[1]
      const content = point[2]
      const showUri = point[3]
      const marker = L.marker([lat, lon]);
      marker.bindPopup(this.mapPopupService.makeCapitalPopup(lat, lon, content, showUri));
      marker.addTo(map);
    }
  }
}
