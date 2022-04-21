import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BreadcrumbService } from './breadcrumb/breadcrumb.service';
import { Angulartics2GoogleAnalytics } from 'angulartics2';

import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'rhizomerEye';

  constructor(router: Router,
              breadService: BreadcrumbService,
              angulartics: Angulartics2GoogleAnalytics,
              private translate: TranslateService) {
    router.events.subscribe(() => breadService.navigateTo(router.url));
    angulartics.startTracking();
    translate.setDefaultLang('en');
    
  }
  useLanguage(language: string): void {
    this.translate.use(language);
}
}
