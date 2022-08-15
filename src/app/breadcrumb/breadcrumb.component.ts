import { BreadcrumbService } from './breadcrumb.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from './breadcrumb';
import { Filter } from './filter';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];
  filters: Filter[] = [];

  constructor(private router: Router,
              public translate: TranslateService,
              private breadService: BreadcrumbService,
              private titleService: Title) {
  }

  ngOnInit() {
    this.breadService.breadcrumbs.subscribe(
      breadcrumbs => {
        this.breadcrumbs = breadcrumbs;
        this.titleService.setTitle(Breadcrumb.toString(this.breadcrumbs) +
          (this.filters.length ? ' - ' + Filter.toString(this.filters, this.translate.currentLang) : ''));
      }
    );
    this.breadService.filtersSelection.subscribe(
      filters => {
        this.filters = filters;
        const currentTitle = this.titleService.getTitle();
        this.titleService.setTitle(currentTitle +
          (this.filters.length ? ' - ' + Filter.toString(this.filters, this.translate.currentLang) : ''));
      }
    );
  }

  removeFilter(filter: Filter){
    this.breadService.removeFacetFilter(filter.classId, filter.facet, filter.range, filter.value)
  }
}
