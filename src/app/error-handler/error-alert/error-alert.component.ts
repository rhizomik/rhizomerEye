import {Component, NgZone, OnInit} from '@angular/core';
import {ErrorMessageService} from '../error-message.service';

@Component({
  selector: 'app-error-alert',
  templateUrl: './error-alert.component.html',
  styleUrls: ['./error-alert.component.css']
})
export class ErrorAlertComponent implements OnInit {

  private ALERT_TIMEOUT = 10000;
  closed: boolean;
  errorMessage: string;
  timerId: number;

  constructor(private errorMessageService: ErrorMessageService,
              private ngZone: NgZone) {
    this.errorMessageService.errorMessage$.subscribe(
      errorMessage => {
        clearTimeout(this.timerId);
        this.errorMessage = errorMessage;
        this.closed = false;

        this.ngZone.runOutsideAngular(() => {
          this.timerId = setTimeout(() => {
            this.ngZone.run(() => {
              this.closed = true;
            });
          }, this.ALERT_TIMEOUT);
        });
      });
  }

  ngOnInit() {
    this.closed = true;
  }

  onClose() {
    this.closed = true;
    clearTimeout(this.timerId);
  }
}
