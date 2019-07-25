import { UriUtils } from '../shared/uriutils';
import { Value } from './value';

export class Property {
  uri: string;
  label: string;
  values: Value[] = [];

  constructor(uri: string, value: any, context: Object = {}) {
    this.uri = uri;
    this.label = UriUtils.localName(uri);
    if (value instanceof Array) {
      this.values = value.map(v => new Value(v, context));
    } else {
      this.values.push(new Value(value, context));
    }
  }

  filterLangValues(lang: string): Value[] {
    return this.values.filter(
      value => !value.language || value.language.indexOf(lang) >= 0);
  }
}
