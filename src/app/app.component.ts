import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BreadcrumbService } from './breadcrumb/breadcrumb.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'rhizomerEye';

  constructor(router: Router,
              breadService: BreadcrumbService) {
    router.events.subscribe( val => {
      breadService.navigateTo(router.url);
    });
  }
}
