import { Injectable } from '@angular/core';
import { RestService } from '../shared/rest.service';
import { Dataset } from './dataset';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Class } from '../class/class';

@Injectable({
  providedIn: 'root'
})
export class DatasetService extends RestService<Dataset> {

  constructor(private http: HttpClient) {
    super('datasets', http);
  }

  datasetGraphs(did: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.API}/datasets/${did}/graphs`);
  }

  updateGraphs(did: string, graphs: string[]): Observable<string[]> {
    return this.http.put<string[]>(`${environment.API}/datasets/${did}/graphs`, graphs);
  }

  serverGraphs(did: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.API}/datasets/${did}/server/graphs`);
  }

  clearClasses(did: string): Observable<Class[]> {
    const body = JSON.stringify([]);
    return this.http.put<Class[]>(`${environment.API}/datasets/${did}/classes`, body, this.getHttpOptions());
  }

  describeDatasetResource(did: string, resource: string): Observable<string[]> {
    let params = new HttpParams();
    params = params.append('uri', resource);
    return this.http.get<any>(
      `${environment.API}/datasets/${did}/describe`, {params: params});
  }

  browseUri(did: string, resource: string): Observable<string[]> {
    let params = new HttpParams();
    params = params.append('uri', resource);
    return this.http.get<any>(
      `${environment.API}/datasets/${did}/browse`, {params: params});
  }

  storeData(did: string, graph: string, file: File) {
    let params = new HttpParams();
    params = params.append('graph', graph);
    let headers = new HttpHeaders();
    headers = headers.append('content-type', file['content-type']);

    return this.http.post<number>(
      `${environment.API}/datasets/${did}/server`, file,
      { params: params, headers: headers });

  }

  replaceData(did: string, graph: string, file: File) {
    let params = new HttpParams();
    params = params.append('graph', graph);
    let headers = new HttpHeaders();
    headers = headers.append('content-type', file['content-type']);

    return this.http.put<number>(
      `${environment.API}/datasets/${did}/server`, file,
      { params: params, headers: headers });

  }
}
