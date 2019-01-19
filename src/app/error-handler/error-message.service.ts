import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';

@Injectable()
export class ErrorMessageService {

  private errorMessageSource = new Subject<string>();

  errorMessage$ = this.errorMessageSource.asObservable();

  constructor() {
  }

  showErrorMessage(errorMessage: string) {
    this.errorMessageSource.next(errorMessage);
  }
}
