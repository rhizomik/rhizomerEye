import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../../login-basic/user';

@Component({
  selector: 'app-linguist-create',
  templateUrl: '../user-form/user-form.component.html'
})
export class UserCreateComponent implements OnInit {
  public user: User;
  public errorMessage: string;
  public formTitle = 'Register User';
  public formSubtitle = 'Register a new user with role USER';

  constructor(private router: Router,
              private userService: UserService) {
  }

  ngOnInit() {
    this.user = new User();
  }

  onSubmit(): void {
    this.userService.create(this.user)
      .subscribe(
        (user: User) => this.router.navigate([user.uri]));
  }
}
