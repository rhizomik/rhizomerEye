import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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
      params = params.append(filter.facet.uri + (filter.range ? ' ' + filter.range.uri : ''), filter.value));
    return this.http.get<any>(
      `${environment.API}/datasets/${did}/classes/${cid}/instances`, {params: params});
  }

  getInstancesLabels(did: string, cid: string, filters: Filter[], page: number, pageSize: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('page', (page - 1).toString());
    params = params.append('size', pageSize.toString());
    filters.forEach((filter: Filter) =>
      params = params.append(filter.facet.uri + (filter.range ? ' ' + filter.range.uri : ''), filter.value));
    return this.http.get<any>(
      `${environment.API}/datasets/${did}/classes/${cid}/instancesLabels`, {params: params});
  }

  getInstancesCount(did: string, cid: string, filters: Filter[]): Observable<number> {
    let params = new HttpParams();
    filters.forEach((filter: Filter) =>
      params = params.append(filter.facet.uri + (filter.range ? ' ' + filter.range.uri : ''), filter.value));
    return this.http.get<number>(
      `${environment.API}/datasets/${did}/classes/${cid}/count`, {params: params});
  }

  getTopClasses(did: string, top: number): Observable<Class[]> {
    let params = new HttpParams();
    params = params.append('top', top.toString());
    return this.http.get<Class[]>(
      `${environment.API}/datasets/${did}/classes`, {params: params});
  }

  getTopClassesContaining(did: string, top: number, containing: string, lang: string): Observable<Class[]> {
    let params = new HttpParams();
    params = params.append('top', top.toString());
    params = params.append('containing', containing);
    params = params.append('lang', lang);
    return this.http.get<Class[]>(
      `${environment.API}/datasets/${did}/classes`, {params: params});
  }

  getClassCurie(did: string, uri: string): Observable<Class> {
    let params = new HttpParams();
    params = params.append('uri', uri);
    return this.http.get<Class>(`${environment.API}/datasets/${did}/classByUri`, { params: params });
  }
}
