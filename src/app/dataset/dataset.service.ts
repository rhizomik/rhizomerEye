import { Injectable } from '@angular/core';
import { RestService } from '../shared/rest.service';
import { Dataset } from './dataset';
import { HttpClient } from '@angular/common/http';
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
}
