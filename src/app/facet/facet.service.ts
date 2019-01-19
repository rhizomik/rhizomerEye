import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Rest3Service } from '../shared/rest3.service';
import { Facet } from './facet';

@Injectable({
  providedIn: 'root'
})
export class FacetService extends Rest3Service<Facet> {

  constructor(private http: HttpClient) {
    super('datasets', 'classes', 'facets', http);
  }
}
