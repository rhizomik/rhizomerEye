import {Injectable} from '@angular/core';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class MapPopupService {

  constructor(private router: Router) {
  }

  getUriLink(content) {
    return window.location.href.slice(0, -15).concat("resource?uri=").concat(content)
  }

  makeCapitalPopup(lat, lon, content: any, showUri: Boolean): string {
    console.log("popup url: ", this.router.url)
    let newContent = content
    console.log("popup url 2: ", newContent)
    if(showUri) {
      newContent = this.getUriLink(content)
      return `` +
        `<div>
          <a href=${newContent}>
                       ${content}
          </a>
           <br>
           lat: ${lat}
           <br>
           lon: ${lon}
        </div>`
    } else {
      return `` +
        `<div>
           ${content}
           <br>
           lat: ${lat}
           <br>
           lon: ${lon}
        </div>`
    }



  }
}
