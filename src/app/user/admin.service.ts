import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Admin} from './admin';
import {environment} from '../../environments/environment';
import {catchError, map} from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

@Injectable()
export class AdminService {

  constructor(private http: HttpClient) {
  }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    };
  }

  // GET /admins
  getAllAdmins(): Observable<Admin[]> {
    return this.http.get(`${environment.API}/admins`).pipe(
      map((res: any) => res._embedded.admins)
    );
  }

  // GET /admins/{id}
  getAdmin(id: string): Observable<Admin> {
    return this.http.get<Admin>(`${environment.API}/admins/${id}`);
  }

  // POST /admins
  addAdmin(admin: Admin): Observable<Admin> {
    const body = JSON.stringify(admin);
    return this.http.post<Admin>(`${environment.API}/admins`, body, this.getHttpOptions());
  }

  // PUT /admins/{id}
  updateAdmin(admin: Admin): Observable<Admin> {
    const adminNoAuthorities = admin;
    adminNoAuthorities.authorities = [];
    const body = JSON.stringify(adminNoAuthorities);
    return this.http.put<Admin>(`${environment.API}${admin.uri}`, body, this.getHttpOptions());
  }

  // DELETE /admins/{id}
  deleteAdmin(admin: Admin): Observable<Response> {
    return this.http.delete<Response>(`${environment.API}${admin.uri}`);
  }

  // GET /admins/search/findByUsernameContaining?text={text}
  getAdminsByUsername(text: string): Observable<Admin[]> {
    return this.http.get(`${environment.API}/admins/search/findByUsernameContaining?text=${text}`).pipe(
      map((res: any) => res._embedded.admins)
    );
  }
}
