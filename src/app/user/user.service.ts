import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RestService } from '../shared/rest.service';
import { User } from '../login-basic/user';

@Injectable()
export class UserService extends RestService<User> {

  constructor(private http: HttpClient) {
    super('users', http);
  }

  search(text: string): Observable<User[]> {
    return this.http.get<User[]>(`${environment.API}/users/search?text=${text}`);
  }
}
