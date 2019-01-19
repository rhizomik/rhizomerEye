import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../login-basic/user';
import { RestService } from '../shared/rest.service';

@Injectable()
export class UserService extends RestService<User> {

  constructor(private http: HttpClient) {
    super('users', http);
  }

  findByUsernameContaining(text: string): Observable<User[]> {
    return this.http.get<User[]>(`${environment.API}/users/search/findByUsernameContaining?text=${text}`);
  }
}
