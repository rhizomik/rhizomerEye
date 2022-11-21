import { Facet } from '../facet/facet';
import { Range } from '../range/range';
import { HttpParams } from '@angular/common/http';
import { convertToParamMap, ParamMap } from '@angular/router';
import { RangeValue } from '../range/rangeValue';
import { TranslateService } from '@ngx-translate/core';
import { UriUtils } from '../shared/uriutils';

export enum Operator {NONE = '', OR = 'OR', AND = 'AND'}

export class Filter {
  classId: string;
  facet: Facet;
  range: Range;
  operator: Operator;
  values: RangeValue[];

  constructor(classId: string, facet: Facet, range: Range, operator: Operator, values: RangeValue[]) {
    this.classId = classId;
    this.facet = facet;
    this.range = range;
    this.operator = operator;
    this.values = values;
  }

  getLabel(translate: TranslateService): string {
    return this.values?.map(value =>
      (value.negated ? translate.instant('breadcrumbs.not') + ' ' : '') + value.getLabel(translate.currentLang))
      .join(this.operator == Operator.OR ? ' ' + translate.instant('breadcrumbs.or') + ' ' :
          ' ' + translate.instant('breadcrumbs.and') + ' ');
  }

  public static parseOperator(value: string): Operator {
    if (value && value.startsWith('OR(') && value.endsWith(')')) {
      return Operator.OR
    } else if (value && value.startsWith('AND(') && value.endsWith(')')) {
      return Operator.AND
    } else {
      return Operator.NONE;
    }
  }

  public static parseValues(value: string, facet: Facet, operator: Operator): RangeValue[] {
    if (!value || value == 'null') return [];
    if (operator == Operator.NONE) {
      return Filter.splitValues(value, facet);
    } else if (operator == Operator.AND || operator == Operator.OR) {
      return Filter.splitValues(value.substring(value.indexOf('(') + 1, value.lastIndexOf(')')), facet);
    } else {
      return [];
    }
  }

  private static splitValues(values: string, facet: Facet): RangeValue[] {
    if (/^!?<[^>]+>(?: !?<[^>]+>)*$/.test(values)) {
      return values.match(/!?<[^>]+>/g).map(match => {
        const negated = match.startsWith('!');
        const uri = match.substring(negated ? 2 : 1, match.length -1);
        const rangeValue = new RangeValue({ uri, curie: ':' + UriUtils.localName(uri) }, facet, []);
        rangeValue.selected = true;
        rangeValue.negated = negated;
        return rangeValue;
      });
    } else if (/^!?"[^"]+"(?: !?"[^"]+")*/.test(values)) {
      return values.match(/!?"[^"]+"/g).map(match => {
        const negated = match.startsWith('!');
        const value = match.substring(negated ? 2 : 1, match.length -1);
        const rangeValue = new RangeValue({ value }, facet, []);
        rangeValue.selected = true;
        rangeValue.negated = negated;
        return rangeValue;
      });
    } else {
      return [];
    }
  }

  private static valuesToParam(values: RangeValue[], operator: Operator): string {
    if (!values.length) return 'null';
    let toParam = '';
    if (operator != Operator.NONE) {
      toParam += operator + '(' + values.map(value => (value.negated ? '!' : '') + value.value).join(' ') + ')';
    } else {
      toParam += values.map(value => (value.negated ? '!' : '') + value.value).join(' ');
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

  static toString(filters: Filter[], translate: TranslateService): string {
    return filters
      .map(filter => filter.facet.getLabel(translate.currentLang) +
        (filter.getLabel(translate) ? ': ' + filter.getLabel(translate) : ''))
      .join(' & ');
  }
}
