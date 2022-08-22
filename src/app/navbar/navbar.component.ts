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
    this.translate.addLangs(['en', 'es', 'ca']);
    this.translate.setDefaultLang('en');
    this.translate.use(this.translate.getLangs().includes(this.translate.getBrowserLang()) ?
      this.translate.getBrowserLang() : this.translate.getDefaultLang());
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

  currentLanguage(): string {
    return this.translate.currentLang || this.translate.getDefaultLang();
  }
}
