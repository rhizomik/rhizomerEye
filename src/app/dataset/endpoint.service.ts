import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Rest2Service } from '../shared/rest2.service';
import { Endpoint } from './endpoint';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EndpointService extends Rest2Service<Endpoint> {

  constructor(private http: HttpClient) {
    super('datasets', 'endpoints', http);
  }

  dataGraphs(did: string, eid: number): Observable<string[]> {
    return this.http.get<string[]>(`${environment.API}/datasets/${did}/endpoints/${eid}/graphs`);
  }

  ontologyGraphs(did: string, eid: number): Observable<string[]> {
    return this.http.get<string[]>(`${environment.API}/datasets/${did}/endpoints/${eid}/ontologies`);
  }

  updateGraphs(did: string, eid: number, graphs: string[]): Observable<string[]> {
    return this.http.put<string[]>(`${environment.API}/datasets/${did}/endpoints/${eid}/graphs`, graphs);
  }

  updateOntologies(did: string, eid: number, ontologies: string[]): Observable<string[]> {
    return this.http.put<string[]>(`${environment.API}/datasets/${did}/endpoints/${eid}/ontologies`, ontologies);
  }

  serverGraphs(did: string, eid: number): Observable<string[]> {
    return this.http.get<string[]>(`${environment.API}/datasets/${did}/endpoints/${eid}/server/graphs`);
  }

  storeData(did: string, eid: number, graph: string, file: File) {
    let params = new HttpParams();
    params = params.append('graph', graph);
    let headers = new HttpHeaders();
    headers = headers.append('content-type', file['content-type']);

    return this.http.post<number>(
      `${environment.API}/datasets/${did}/endpoints/${eid}/server`, file,
      { params: params, headers: headers });

  }

  replaceData(did: string, eid: number, graph: string, file: File) {
    let params = new HttpParams();
    params = params.append('graph', graph);
    let headers = new HttpHeaders();
    headers = headers.append('content-type', file['content-type']);

    return this.http.put<number>(
      `${environment.API}/datasets/${did}/endpoints/${eid}/server`, file,
      { params: params, headers: headers });

  }

  updateEndpoint(id1: string, endpoint: Endpoint): Observable<Endpoint> {
    const body = JSON.stringify(endpoint);
    return this.http.put<Endpoint>(`${environment.API}/datasets/${id1}/endpoints/${endpoint.id}`,
      body, this.getHttpOptions());
  }

  patchEndpoint(id1: string, endpoint: Endpoint): Observable<Endpoint> {
    const body = JSON.stringify(endpoint);
    return this.http.patch<Endpoint>(`${environment.API}/datasets/${id1}/endpoints/${endpoint.id}`,
      body, this.getHttpOptions());
  }

  deleteEndpoint(id1: string, endpoint: Endpoint): Observable<Response> {
    return this.http.delete<Response>(`${environment.API}/datasets/${id1}/endpoints/${endpoint.id}`);
  }
}
