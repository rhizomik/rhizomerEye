import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Rest3Service } from '../shared/rest3.service';
import { Facet } from './facet';

@Injectable({
  providedIn: 'root'
})
export class FacetService extends Rest3Service<Facet> {

  constructor(private http: HttpClient) {
    super('datasets', 'classes', 'facets', http);
  }

  getAllRelevant(did: string, cid: string, relevance: number): Observable<Facet[]> {
    let params = new HttpParams();
    params = params.append('relevance', relevance.toString());
    return this.http.get<Facet[]>(
      `${environment.API}/datasets/${did}/classes/${cid}/facets`, {params: params});
  }
}
