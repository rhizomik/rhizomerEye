import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../../login-basic/user';

@Component({
  selector: 'app-linguist-edit',
  templateUrl: '../user-form/user-form.component.html'
})
export class UserEditComponent implements OnInit {
  public user: User;
  public errorMessage: string;
  public formTitle = 'Edit User';
  public formSubtitle = 'Edit a user with role USER';

  constructor(private route: ActivatedRoute,
              private router: Router,
              private userService: UserService) {
  }

  ngOnInit() {
    this.user = new User();
    const id = this.route.snapshot.paramMap.get('id');
    this.userService.get(id).subscribe(
      linguist => this.user = linguist);
  }

  onSubmit(): void {
    this.user.authorities = [];
    this.userService.update(this.user)
      .subscribe(
        (user: User) => this.router.navigate([user.uri]));
  }
}
