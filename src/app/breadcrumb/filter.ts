import { Facet } from '../facet/facet';
import { Range } from '../range/range';
import { HttpParams } from '@angular/common/http';
import { convertToParamMap, ParamMap } from '@angular/router';
import { UriUtils } from '../shared/uriutils';

export class Filter {
  classId: string;
  facet: Facet;
  range: Range;
  value: string;
  label: string;

  constructor(classId: string, facet: Facet, range: Range, value: string) {
    this.classId = classId;
    this.facet = facet;
    this.range = range;
    this.value = value && value !== 'null' ? value : null;
    this.label = this.value && this.value.startsWith('<') && this.value.endsWith('>') ?
      UriUtils.localName(this.value.substring(1, this.value.length - 1)) : this.value;
  }

  static toParam(filters: Filter[]): HttpParams {
    let params = new HttpParams();
    filters.forEach((filter: Filter) =>
      params = params.append(filter.facet.curie + (filter.range ? ' ' + filter.range.curie : ''), filter.value));
    return params;
  }

  static toParamMap(filters: Filter[]): ParamMap {
    const params = {};
    filters.forEach((filter: Filter) =>
      params[filter.facet.curie + (filter.range ? ' ' + filter.range.curie : '')] = filter.value);
    return convertToParamMap(params);
  }

  static fromParam(classId: string, facets: Facet[], params: ParamMap): Filter[] {
    return params.keys.map(key => {
      const value = params.get(key);
      const facetCurie = key.split(' ')[0] || null;
      const rangeCurie = key.split(' ')[1] || null;
      const facet = facets.find(f => f.curie === facetCurie);
      if (facet) {
        const range = facet.ranges.find(r => r.curie === rangeCurie);
        return new Filter(classId, facet, range, value);
      } else if (facetCurie === 'rhz:contains') {
        return new Filter(classId, Facet.searchFacet, Range.searchRange, value);
      } else {
        return null;
      }
    }).filter(filter => !!filter);
  }

  static toString(filters: Filter[], lang: string): string {
    return filters
      .map(filter => filter.facet.getLabel(lang) + (filter.label ? ': ' + filter.label : ''))
      .join(' & ');
  }
}
