import { Injectable } from '@angular/core';
import { RestService } from '../shared/rest.service';
import { Dataset } from './dataset';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Class } from '../class/class';
import { IncomingFacet } from '../facet/incomingFacet';
import { Value } from '../range/value';

@Injectable({
  providedIn: 'root'
})
export class DatasetService extends RestService<Dataset> {

  constructor(private http: HttpClient) {
    super('datasets', http);
  }

  clearClasses(did: string): Observable<Class[]> {
    const body = JSON.stringify([]);
    return this.http.put<Class[]>(`${environment.API}/datasets/${did}/classes`, body, this.getHttpOptions());
  }

  describeDatasetResource(did: string, resource: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('uri', resource);
    return this.http.get<any>(
      `${environment.API}/datasets/${did}/describe`, {params: params});
  }

  updateDatasetResource(did: string, resource: string, updated: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('uri', resource);
    return this.http.put<any>(`${environment.API}/datasets/${did}/update`, updated,
      { params: params, headers: new HttpHeaders({'Content-Type': 'application/ld+json'}) });
  }

  browseUriData(did: string, resource: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('uri', resource);
    let headers = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    return this.http.get<any>(
      `${environment.API}/datasets/${did}/browseData`, {params: params, headers: headers});
  }

  browseUriContent(did: string, resource: string): Observable<string> {
    let params = new HttpParams();
    params = params.append('uri', resource);
    let headers = new HttpHeaders();
    headers = headers.append('Accept', 'text/html');
    return this.http.get(`${environment.API}/datasets/${did}/browse`,
      { params: params, headers: headers, responseType: 'text' });
  }

  resourceIncomingFacets(did: string, resource: string): Observable<IncomingFacet[]> {
    let params = new HttpParams();
    params = params.append('uri', resource);
    let headers = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    return this.http.get<IncomingFacet[]>(
      `${environment.API}/datasets/${did}/incoming`, {params: params, headers: headers});
  }

  searchInstances(did: string, text: string, page: number, pageSize: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('text', text);
    params = params.append('page', (page - 1).toString());
    params = params.append('size', pageSize.toString());
    return this.http.get<any>(
      `${environment.API}/datasets/${did}/search`, {params: params});
  }

  getSearchInstancesCount(did: string, text: string): Observable<number> {
    let params = new HttpParams();
    params = params.append('text', text);
    return this.http.get<number>(
      `${environment.API}/datasets/${did}/searchCount`, {params: params});
  }

  searchTypesFacetValues(did: string, text: string): Observable<Value[]> {
    let params = new HttpParams();
    params = params.append('text', text);
    params = params.append('page', '0');
    params = params.append('size', '100');
    return this.http.get<any>(
      `${environment.API}/datasets/${did}/searchTypes`, {params: params});
  }
}
