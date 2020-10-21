import { Injectable } from '@angular/core';
import { Breadcrumb } from './breadcrumb';
import { BehaviorSubject } from 'rxjs';
import { Facet } from '../facet/facet';
import { Range } from '../range/range';
import { Filter } from './filter';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  public breadcrumbs: BehaviorSubject<Breadcrumb[]>;
  public filtersSelection: BehaviorSubject<Filter[]>;
  public filters: Filter[] = [];

  constructor(private location: Location) {
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
    this.filtersSelection.next(this.filters);
    this.updateLocation();
  }

  addFacetFilters(filters: Filter[]) {
    this.filters = filters;
    this.filtersSelection.next(this.filters);
    this.updateLocation();
  }

  removeFacetFilter(classId: string, facet: Facet, range: Range, value: string) {
    this.filters = this.filters.filter((filter: Filter) =>
      (filter.classId !== classId || filter.facet.id !== facet.id ||
        ( filter.range && filter.range.id !== range.id ) || filter.value !== value));
    this.filtersSelection.next(this.filters);
    this.updateLocation();
  }

  clearFilter() {
    this.filters = [];
    this.filtersSelection.next(this.filters);
  }

  private updateLocation() {
    const locationPath = this.location.path().split('?')[0];
    const locationQuery = Filter.toParam(this.filters).toString();
    this.location.go(locationPath, locationQuery);
    this.navigateTo(this.location.path());
  }
}
