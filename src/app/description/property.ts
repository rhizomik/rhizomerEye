import { UriUtils } from '../shared/uriutils';
import { Value } from './value';

export class Property {
  uri: string;
  label: string;
  values: Value[] = [];

  constructor(key: string, value: any, context: Object = {}, labels: Map<string, any>) {
    this.uri = UriUtils.expandUri(key, context);
    this.label = UriUtils.getLabel(this.uri, labels);
    if (value instanceof Array) {
      this.values = value.map(v => new Value(key, v, context, labels));
    } else if (value['@list']) {
      this.values = value['@list'].map(v => new Value(key, v, context, labels));
    } else {
      this.values.push(new Value(key, value, context, labels));
    }
  }

  filterLangValues(lang: string): Value[] {
    const selected = this.values.filter(
      value => lang === 'any' || !value.language || value.language.indexOf(lang) >= 0);
    return selected.length > 0 ? selected : this.values;
  }
}
