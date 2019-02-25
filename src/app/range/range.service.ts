import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Rest4Service } from '../shared/rest4.service';
import { Range } from './range';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Value } from './value';
import { Filter } from '../breadcrumb/filter';

@Injectable({
  providedIn: 'root'
})
export class RangeService extends Rest4Service<Range> {

  constructor(private http: HttpClient) {
    super('datasets', 'classes', 'facets', 'ranges', http);
  }

  getValues(did: string, cid: string, fid: string, rid: string, filters: Filter[]): Observable<Value[]> {
    let params = new HttpParams();
    filters.forEach((filter: Filter) =>
      params = params.append(filter.facet.uri, filter.value));
    return this.http.get<Value[]>(
      `${environment.API}/datasets/${did}/classes/${cid}/facets/${fid}/ranges/${rid}/values`,
      {params: params});
  }
}
