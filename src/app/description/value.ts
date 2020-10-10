import { UriUtils } from '../shared/uriutils';

export class Value {
  uri: string;
  label: string;
  value: string;
  language: string;
  type: string;

  constructor(value: any, context: Object = {}, labels: Map<string, string> = new Map()) {
    if (value['@value']) {
      this.value = value['@value'];
      if (value['@type']) {
        this.type = UriUtils.expandUri(value['@type'], context);
      }
    } else if (value['@id']) {
      this.uri = UriUtils.expandUri(value['@id'], context);
      this.label = UriUtils.getLabel(this.uri, labels);
    } else if (typeof value === 'string') {
      const uri = UriUtils.expandUri(value, context);
      if (UriUtils.isUrl(uri) || uri.startsWith('urn:') || uri.startsWith('_:')) {
        this.uri = uri;
        this.label = UriUtils.getLabel(this.uri, labels);
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

  static getValues(input: any, context: Object = {}, labels: Map<string, string> = new Map()) {
    return input instanceof Array ?
      input.map(v => new Value(v, context, labels)) :
      [new Value(input, context, labels)];
  }

  isAnon() {
    if (this.asString().startsWith('_:')) {
      return true;
    }
    return false;
  }

  asString(): string {
    return this.value ? this.value : this.uri;
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
