import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RestService } from '../shared/rest.service';
import { Admin } from './admin';

@Injectable()
export class AdminService extends RestService<Admin> {

  constructor(private http: HttpClient) {
    super('admins', http);
  }
}
