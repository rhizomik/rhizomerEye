import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapPopupService {

  constructor() { }

  makeCapitalPopup(data: any): string {
    return `` +
      `<div>Numerical: aaaaa ${ data }</div>` + //${ data.name }
      `<div></div>`
  }
}
