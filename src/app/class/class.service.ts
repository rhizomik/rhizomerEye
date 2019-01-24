import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Rest2Service } from '../shared/rest2.service';
import { Class } from './class';

@Injectable({
  providedIn: 'root'
})
export class ClassService extends Rest2Service<Class> {

  constructor(private http: HttpClient) {
    super('datasets', 'classes', http);
  }

  getInstances(did: string, cid: string): Observable<any> {
    return this.http.get<any>(
      `${environment.API}/datasets/${did}/classes/${cid}/instances`);
  }
}
