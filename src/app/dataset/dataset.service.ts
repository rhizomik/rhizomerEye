import { Injectable } from '@angular/core';
import { RestService } from '../shared/rest.service';
import { Dataset } from './dataset';
import { HttpClient, HttpParams } from '@angular/common/http';
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
}
