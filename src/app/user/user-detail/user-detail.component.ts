import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../../login-basic/user';
import { AuthenticationBasicService } from '../../login-basic/authentication-basic.service';

@Component({
  selector: 'app-linguist-detail',
  templateUrl: './user-detail.component.html'
})
export class UserDetailComponent implements OnInit {
  public user: User = new User();

  constructor(private route: ActivatedRoute,
              private userService: UserService,
              private authService: AuthenticationBasicService,
              private router: Router) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.userService.get(id).subscribe(
      user => this.user = user);
  }

  public delete() {
    this.userService.delete(this.user).subscribe(
      () => {
        if (this.authService.isAdmin()) {
          this.router.navigate(['users']);
        } else {
          this.authService.logout();
          this.router.navigate(['/about']);
        }
      });
  }
}
