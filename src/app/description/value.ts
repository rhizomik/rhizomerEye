import { UriUtils } from '../shared/uriutils';

export class Value {
  uri: string;
  label: string;
  value: string;
  language: string;
  type: string;

  constructor(key: string, value: any, context: Object = {}, labels: Map<string, any> = new Map(), prefLang = 'en') {
    if (value['@value']) {
      this.value = value['@value'];
      if (value['@type']) {
        this.type = UriUtils.expandUri(value['@type'], context);
      }
    } else if (value['@id']) {
      this.uri = UriUtils.expandUri(value['@id'], context);
      this.label = UriUtils.getLabel(this.uri, labels, prefLang);
    } else if (typeof value === 'string') {
      const isUri = context[key] && context[key]['@type'] ? context[key]['@type'] === '@id' : false;
      if (isUri || key === '@type') {
        this.uri = UriUtils.expandUri(value, context);
        this.label = UriUtils.getLabel(this.uri, labels, prefLang);
      } else {
        this.value = value;
      }
    } else {
      this.value = value;
    }
    if (value['@language']) {
      this.language = value['@language'];
    }
  }

  static getValues(key: string, input: any, context: Object = {},
                   labels: Map<string, Value> = new Map(), prefLang: string) {
    return input instanceof Array ?
      input.map(v => new Value(key, v, context, labels, prefLang)) :
      [new Value(key, input, context, labels, prefLang)];
  }

  isAnon() {
    return this.asString().startsWith('_:');
  }

  isUrlValue() {
    return UriUtils.isUrl(this.asString());
  }

  asString(): string {
    return this.value !== undefined ? this.value.toString() : this.uri;
  }

  asJsonLd(): string {
    if (this.value) {
      return '{ "@value": ' + JSON.stringify(this.value) +
      (this.language ? ', "@language": "' + this.language + '"' : '') +
      (this.type ? ', "@type": "' + this.type + '"' : '') +
      ' }';
    } else {
      return '{ "@id": "' + this.uri + '" }';
    }
  }
}
