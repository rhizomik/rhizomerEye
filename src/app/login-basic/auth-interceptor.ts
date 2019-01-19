import {Injectable} from '@angular/core';
import {HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {AuthenticationBasicService} from './authentication-basic.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authentication: AuthenticationBasicService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (this.authentication.isLoggedIn()) {
      const authToken = this.authentication.getCurrentUser().authorization;
      const authReq = req.clone({
        headers: req.headers.set('Authorization', authToken)
      });
      return next.handle(authReq);
    } else {
      return next.handle(req);
    }
  }
}
