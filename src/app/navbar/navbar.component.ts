import {Component, OnInit} from '@angular/core';
import { AuthenticationBasicService } from '../login-basic/authentication-basic.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  public isCollapsed: boolean;

  constructor(private authService: AuthenticationBasicService) {
  }

  ngOnInit() {
    this.isCollapsed = true;
  }

  isAdmin() {
    return this.authService.isAdmin();
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }
}
