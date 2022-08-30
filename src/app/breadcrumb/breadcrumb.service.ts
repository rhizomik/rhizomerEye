import { Injectable } from '@angular/core';
import { Breadcrumb } from './breadcrumb';
import { BehaviorSubject } from 'rxjs';
import { Facet } from '../facet/facet';
import { Range } from '../range/range';
import { Filter } from './filter';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Angulartics2GoogleAnalytics } from 'angulartics2';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  public breadcrumbs: BehaviorSubject<Breadcrumb[]>;
  public filtersSelection: BehaviorSubject<Filter[]>;
  public filters: Filter[] = [];

  constructor(private location: Location,
              private titleService: Title,
              private angularticsService: Angulartics2GoogleAnalytics) {
    this.breadcrumbs = new BehaviorSubject([]);
    this.filtersSelection = new BehaviorSubject([]);
  }

  public navigateTo(url: string) {
    this.breadcrumbs.next(url.split('?')[0].split('/')
      .filter(step => step !== '')
      .map(step => new Breadcrumb(step, url)));
  }

  addFacetFilter(classId: string, facet: Facet, range: Range, value: string) {
    this.filters = this.filters.concat(new Filter(classId, facet, range, value));
    this.updateLocation();
  }

  addFacetFilters(filters: Filter[]) {
    this.filters = filters;
    this.updateLocation();
  }

  removeFacetFilter(classId: string, facet: Facet, range: Range, value: string) {
    this.filters = this.filters.filter((filter: Filter) =>
      (filter.classId !== classId || filter.facet.id !== facet.id ||
        ( filter.range && filter.range.id !== range.id ) || filter.value !== value));
    this.updateLocation();
  }

  clearFacetFiltersStartingWith(classId: string, facet: Facet, range: Range, value: string) {
    this.filters = this.filters.filter((filter: Filter) =>
      (filter.classId !== classId || filter.facet.id !== facet.id ||
        ( filter.range && filter.range.id !== range.id ) || filter.value.indexOf(value) != 0 ));
  }

  clearFilter() {
    this.filters = [];
    this.filtersSelection.next(this.filters);
  }

  updateLocation() {
    this.filtersSelection.next(this.filters);
    const locationPath = this.location.path().split('?')[0];
    const locationQuery = Filter.toParam(this.filters).toString();
    this.location.go(locationPath, locationQuery);
    this.navigateTo(this.location.path());
    this.angularticsService.pageTrack(this.location.path());
  }
}
