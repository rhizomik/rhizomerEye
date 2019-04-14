import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Rest2Service } from '../shared/rest2.service';
import { Class } from './class';
import { Filter } from '../breadcrumb/filter';

@Injectable({
  providedIn: 'root'
})
export class ClassService extends Rest2Service<Class> {

  constructor(private http: HttpClient) {
    super('datasets', 'classes', http);
  }

  getInstances(did: string, cid: string, filters: Filter[], page: number, pageSize: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('page', (page - 1).toString());
    params = params.append('size', pageSize.toString());
    filters.forEach((filter: Filter) =>
      params = params.append(filter.facet.uri, filter.value));
    return this.http.get<any>(
      `${environment.API}/datasets/${did}/classes/${cid}/instances`, {params: params});
  }

  getInstancesCount(did: string, cid: string, filters: Filter[]): Observable<number> {
    let params = new HttpParams();
    filters.forEach((filter: Filter) =>
      params = params.append(filter.facet.uri, filter.value));
    return this.http.get<number>(
      `${environment.API}/datasets/${did}/classes/${cid}/count`, {params: params});
  }
}
