import { UriUtils } from '../shared/uriutils';
import { Value } from './value';

export class Property {
  uri: string;
  label: string;
  values: Value[] = [];

  constructor(key: string, value: any, context: Object = {}, labels: Map<string, any>, prefLang = 'en') {
    this.uri = UriUtils.expandUri(key, context);
    this.label = UriUtils.getLabel(this.uri, labels, prefLang);
    if (value instanceof Array) {
      this.values = value.map(v => new Value(key, v, context, labels, prefLang));
    } else if (value['@list']) {
      this.values = value['@list'].map(v => new Value(key, v, context, labels, prefLang));
    } else {
      this.values.push(new Value(key, value, context, labels, prefLang));
    }
  }

  filterLangValues(lang: string): Value[] {
    const preferred = this.values.filter(value => value.language && value.language.startsWith(lang));
    const noLang = this.values.filter(value => !value.language);
    return preferred.length > 0 ? preferred : (noLang.length > 0 ? noLang : this.values);
  }
}
