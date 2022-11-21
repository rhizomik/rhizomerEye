import { Injectable } from '@angular/core';
import { Breadcrumb } from './breadcrumb';
import { BehaviorSubject } from 'rxjs';
import { Facet } from '../facet/facet';
import { Range } from '../range/range';
import { Filter, Operator } from './filter';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Angulartics2GoogleAnalytics } from 'angulartics2';
import { RangeService } from '../range/range.service';
import { RangeValue } from '../range/rangeValue';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  public breadcrumbs: BehaviorSubject<Breadcrumb[]>;
  public filtersSelection: BehaviorSubject<Filter[]>;
  public filters: Filter[] = [];

  constructor(private location: Location,
              private titleService: Title,
              private rangeService: RangeService,
              private angularticsService: Angulartics2GoogleAnalytics) {
    this.breadcrumbs = new BehaviorSubject([]);
    this.filtersSelection = new BehaviorSubject([]);
  }

  public navigateTo(url: string) {
    this.breadcrumbs.next(url.split('?')[0].split('/')
      .filter(step => step !== '')
      .map(step => new Breadcrumb(step, url)));
  }

  addFacetFilter(filter: Filter) {
    this.filters = this.filters.concat(filter);
    this.updateLocation();
  }

  addFacetFilters(filters: Filter[]) {
    this.filters = filters;
    this.updateLocation();
  }

  addFacetFilterValue(classId: string, facet: Facet, range: Range, value: RangeValue, operator: Operator) {
    let filter = this.popFacetFilter(classId, facet, range);
    if (!filter) {
      this.filters = this.filters.concat(new Filter(classId, facet, range, operator, [value]));
    } else {
      filter.values = filter.values.concat(value);
      if (filter.values.length > 1) {
        filter.operator = operator;
      }
      this.filters = this.filters.concat(filter);
    }
    this.updateLocation();
  }

  negateFacetFilterValue(classId: string, facet: Facet, range: Range, value: RangeValue, operator: Operator) {
    const negatedValue = value;
    negatedValue.negated = true;
    let filter = this.popFacetFilter(classId, facet, range);
    if (!filter) {
      this.filters = this.filters.concat(new Filter(classId, facet, range, Operator.NONE, [negatedValue]));
    } else {
      filter.values = filter.values.filter(existing => existing.value !== negatedValue.value).concat(negatedValue);
      if (filter.values.length > 1) {
        filter.operator = operator;
      }
      this.filters = this.filters.concat(filter);
    }
    this.updateLocation();
  }

  removeFacetFilterValue(classId: string, facet: Facet, range: Range, value: RangeValue) {
    let filter = this.popFacetFilter(classId, facet, range);
    if (filter) {
      filter.values = filter.values.filter(existing => existing.value !== value.value);
      if (filter.values.length == 1) {
        filter.operator = Operator.NONE;
      }
      if (filter.values.length > 0) {
        this.filters = this.filters.concat(filter);
      }
    }
    this.updateLocation();
  }

  removeFacetFilter(classId: string, facet: Facet, range: Range) {
    this.filters = this.filters.filter((filter: Filter) =>
      (filter.classId !== classId || filter.facet.id !== facet.id ||
        (filter.range && filter.range.id !== range.id)));
    this.updateLocation();
  }

  getFacetFilter(classId: string, facet: Facet, range: Range): Filter {
    return this.filters.find((filter: Filter) =>
      (filter.classId == classId && filter.facet.id == facet.id && filter.range.id == range.id));
  }

  popFacetFilter(classId: string, facet: Facet, range: Range): Filter {
    const filter = this.getFacetFilter(classId, facet, range);
    this.filters = this.filters.filter((filter: Filter) =>
      (filter.classId !== classId || filter.facet.id !== facet.id ||
        (filter.range && filter.range.id !== range.id)));
    return filter;
  }

  clearFilter() {
    this.filters = [];
    this.filtersSelection.next(this.filters);
  }

  updateLocation() {
    const locationPath = this.location.path().split('?')[0];
    const locationQuery = Filter.toParam(this.filters).toString();
    this.location.go(locationPath, locationQuery);
    this.navigateTo(this.location.path());
    this.angularticsService.pageTrack(this.location.path());
    this.filtersSelection.next(this.filters);
  }
}
