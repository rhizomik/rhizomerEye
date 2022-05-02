import {Component, OnInit} from '@angular/core';
import { AuthenticationBasicService } from '../login-basic/authentication-basic.service';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  public isCollapsed: boolean;

  constructor(private authService: AuthenticationBasicService,
    private translate: TranslateService) {

      translate.setDefaultLang('ca');
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

  useLanguage(language: string): void {
    this.translate.use(language);
}
}
