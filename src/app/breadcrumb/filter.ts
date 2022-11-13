import { Facet } from '../facet/facet';
import { Range } from '../range/range';
import { HttpParams } from '@angular/common/http';
import { convertToParamMap, ParamMap } from '@angular/router';
import { UriUtils } from '../shared/uriutils';

export enum Operator {NONE = '', OR = 'OR', AND = 'AND'}

export class Filter {
  classId: string;
  facet: Facet;
  range: Range;
  operator: Operator;
  values: string[];

  constructor(classId: string, facet: Facet, range: Range, value: string) {
    this.classId = classId;
    this.facet = facet;
    this.range = range;
    this.operator = Filter.parseOperator(value);
    this.values = Filter.parseValues(value, this.operator);
  }

  getLabel(): string {
    return this.values && this.values.length ?
      this.values.map(value => {
        if (value.startsWith('<') && value.endsWith('>')) {
          return UriUtils.localName(value.substring(1, value.length - 1))
        } else {
          const literal = value.substring(1, value.length - 1);
          if (UriUtils.isUrl(literal)) {
            return UriUtils.localName(literal);
          } else {
            return literal;
          }
        }
      }).join(this.operator == Operator.OR ? ' or ' : ' and ') :
      null;
  }

  private static parseOperator(value: string): Operator {
    if (value && value.startsWith('OR(') && value.endsWith(')')) {
      return Operator.OR
    } else if (value && value.startsWith('AND(') && value.endsWith(')')) {
      return Operator.AND
    } else {
      return Operator.NONE;
    }
  }

  private static parseValues(value: string, operator: Operator): string[] {
    if (!value || value == 'null') return [];
    if (operator == Operator.NONE) {
      return [value];
    } else if (operator == Operator.AND || operator == Operator.OR) {
      return Filter.splitValues(value.substring(value.indexOf('(') + 1, value.lastIndexOf(')')));
    } else {
      return [];
    }
  }

  private static splitValues(values: string): string[] {
    if (/^!?<[^>]+>(?: !?<[^>]+>)*$/.test(values)) {
      return values.match(/!?<[^>]+>/g);
    } else if (/^!?"[^"]+"(?: !?"[^"]+")*/.test(values)) {
      return values.match(/!?"[^"]+"/g);
    } else {
      return [];
    }
  }

  private static valuesToParam(values: string[], operator: Operator): string {
    if (!values.length) return 'null';
    let toParam = '';
    if (operator != Operator.NONE) {
      toParam += operator + '(' + values.join(' ') + ')';
    } else {
      toParam += values.join(' ');
    }
    return toParam;
  }

  static toQuery(filters: Filter[]): HttpParams {
    let params = new HttpParams();
    filters.forEach((filter: Filter) =>
      params = params.append(filter.facet.uri + (filter.range ? ' ' + filter.range.uri : ''),
        this.valuesToParam(filter.values, filter.operator)));
    return params;
  }

  static toParam(filters: Filter[]): HttpParams {
    let params = new HttpParams();
    filters.forEach((filter: Filter) =>
      params = params.append(filter.facet.curie + (filter.range ? ' ' + filter.range.curie : ''),
        this.valuesToParam(filter.values, filter.operator)));
    return params;
  }

  static toParamMap(filters: Filter[]): ParamMap {
    const params = {};
    filters.forEach((filter: Filter) =>
      params[filter.facet.curie + (filter.range ? ' ' + filter.range.curie : '')] =
        this.valuesToParam(filter.values, filter.operator));
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
      .map(filter => filter.facet.getLabel(lang) + (filter.getLabel() ? ': ' + filter.getLabel() : ''))
      .join(' & ');
  }
}
