import {Component, OnInit} from '@angular/core';
import {AuthenticationBasicService} from './authentication-basic.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: [],
})
export class LoginFormComponent implements OnInit {

  constructor(private authenticationService: AuthenticationBasicService,
              private location: Location) {
  }

  ngOnInit() {
  }

  onSubmit(userInput: HTMLInputElement, passwordInput: HTMLInputElement): void {
    this.authenticationService.login(userInput.value, passwordInput.value)
      .subscribe(
        user => {
          this.authenticationService.storeCurrentUser(user);
          this.location.back();
        });
  }

  onCancel(): void {
    this.location.back();
  }
}
