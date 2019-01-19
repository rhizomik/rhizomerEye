import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class RestService<T> {
  private readonly resource: string;

  constructor(resource: string,
              private httpClient: HttpClient) {
    this.resource = resource;
  }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    };
  }

  getAll(): Observable<T[]> {
    return this.httpClient.get<T[]>(`${environment.API}/${this.resource}`);
  }

  get(id: string): Observable<T> {
    return this.httpClient.get<T>(`${environment.API}/${this.resource}/${id}`);
  }

  create(entity: T): Observable<T> {
    const body = JSON.stringify(entity);
    return this.httpClient.post<T>(`${environment.API}/${this.resource}`, body, this.getHttpOptions());
  }

  update(entity: T): Observable<T> {
    const body = JSON.stringify(entity);
    return this.httpClient.put<T>(`${environment.API}/${this.resource}/${entity['id']}`, body, this.getHttpOptions());
  }

  patch(entity: T): Observable<T> {
    const body = JSON.stringify(entity);
    return this.httpClient.patch<T>(`${environment.API}/${this.resource}/${entity['id']}`, body, this.getHttpOptions());
  }

  delete(entity: T): Observable<Response> {
    return this.httpClient.delete<Response>(`${environment.API}/${this.resource}/${entity['id']}`);
  }
}
