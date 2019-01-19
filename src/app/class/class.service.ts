import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Rest2Service } from '../shared/rest2.service';
import { Class } from './class';

@Injectable({
  providedIn: 'root'
})
export class ClassService extends Rest2Service<Class> {

  constructor(private http: HttpClient) {
    super('datasets', 'classes', http);
  }
}
