import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BreadcrumbService } from './breadcrumb/breadcrumb.service';
import { Angulartics2GoogleAnalytics } from 'angulartics2';


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
            ) {
    router.events.subscribe(() => breadService.navigateTo(router.url));
    angulartics.startTracking();

    
  }
}
