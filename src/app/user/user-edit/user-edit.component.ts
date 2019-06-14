import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { AdminService } from '../admin.service';
import { User } from '../../login-basic/user';
import { AuthenticationBasicService } from '../../login-basic/authentication-basic.service';

@Component({
  selector: 'app-linguist-edit',
  templateUrl: '../user-form/user-form.component.html'
})
export class UserEditComponent implements OnInit {
  public user: User = new User();
  constructor(private route: ActivatedRoute,
              private router: Router,
              private userService: UserService,
              private adminService: AdminService,
              private authService: AuthenticationBasicService) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.userService.get(id).subscribe(
      linguist => this.user = linguist);
  }

  onSubmit(): void {
    if (this.user.authorities.length > 0 &&
        this.user.authorities[0].authority.indexOf('ADMIN') > 0) {
      this.user.authorities = [];
      this.adminService.update(this.user)
      .subscribe(
        (user: User) => this.logoutIfChangedOwnPassword(user));
    } else {
      this.user.authorities = [];
      this.userService.update(this.user)
      .subscribe(
        (user: User) => this.logoutIfChangedOwnPassword(user));
    }
  }

  logoutIfChangedOwnPassword(user: User) {
    if (this.authService.getCurrentUser().username === user.username) {
      this.authService.logout();
      this.router.navigate(['/about']);
    } else {
      this.router.navigate(['/users', user.id]);
    }
  }
}
