import { BreadcrumbService } from './breadcrumb.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from './breadcrumb';
import { Filter } from './filter';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];
  filters: Filter[] = [];

  constructor(private router: Router,
              private breadService: BreadcrumbService) {
  }

  ngOnInit() {
    this.breadService.breadcrumbs.subscribe(
      breadcrumbs => {
        this.breadcrumbs = breadcrumbs;
      }
    );
    this.breadService.filtersSelection.subscribe(
      filters => {
        this.filters = filters;
      }
    );
  }
}
