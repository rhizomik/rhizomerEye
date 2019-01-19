import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { User } from '../../login-basic/user';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  public users: User[] = [];
  public totalUsers = 0;
  public errorMessage = '';

  constructor(
    public router: Router,
    private userService: UserService) {
  }

  ngOnInit() {
    this.userService.getAll()
      .subscribe(
        (users: User[]) => {
          this.users = users;
          this.totalUsers = users.length;
        });
  }

  showSearchResults(users) {
    this.users = users;
  }
}
