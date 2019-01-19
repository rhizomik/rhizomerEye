import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../../login-basic/user';

@Component({
  selector: 'app-linguist-detail',
  templateUrl: './user-detail.component.html'
})
export class UserDetailComponent implements OnInit {
  public user: User = new User();

  constructor(private route: ActivatedRoute,
              private userService: UserService,
              private router: Router) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.userService.get(id).subscribe(
      user => this.user = user);
  }

  public delete() {
    this.userService.delete(this.user).subscribe(
      () => this.router.navigate(['users']));
  }
}
