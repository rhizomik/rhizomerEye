import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class Rest4Service<T> {
  private readonly resource1: string;
  private readonly resource2: string;
  private readonly resource3: string;
  private readonly resource4: string;

  constructor(resource1: string, resource2: string, resource3: string, resource4: string,
              private httpClient: HttpClient) {
    this.resource1 = resource1;
    this.resource2 = resource2;
    this.resource3 = resource3;
    this.resource4 = resource4;
  }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    };
  }

  getAll(id1: string, id2: string, id3: string): Observable<T[]> {
    return this.httpClient.get<T[]>(`${environment.API}/${this.resource1}/${id1}/${this.resource2}/${id2}/${this.resource3}/${id3}/${this.resource4}`);
  }

  get(id1: string, id2: string, id3: string, id4: string): Observable<T> {
    return this.httpClient.get<T>(`${environment.API}/${this.resource1}/${id1}/${this.resource2}/${id2}/${this.resource3}/${id3}/${this.resource4}/${id4}`);
  }

  create(id1: string, id2: string, id3: string, entity: T): Observable<T> {
    const body = JSON.stringify(entity);
    return this.httpClient.post<T>(`${environment.API}/${this.resource1}/${id1}/${this.resource2}/${id2}/${this.resource3}/${id3}/${this.resource4}`,
      body, this.getHttpOptions());
  }

  update(entity: T): Observable<T> {
    const body = JSON.stringify(entity);
    return this.httpClient.put<T>(`${environment.API}${entity['id']}`, body, this.getHttpOptions());
  }

  patch(entity: T): Observable<T> {
    const body = JSON.stringify(entity);
    return this.httpClient.patch<T>(`${environment.API}${entity['id']}`, body, this.getHttpOptions());
  }

  delete(entity: T): Observable<Response> {
    return this.httpClient.delete<Response>(`${environment.API}${entity['id']}`);
  }
}
