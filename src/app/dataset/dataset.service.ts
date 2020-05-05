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
