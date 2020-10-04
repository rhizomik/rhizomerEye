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
      if (UriUtils.isUrl(uri) || uri.startsWith('urn:')) {
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

  asJsonLd(): string {
    if (this.value) {
      return '{ "@value": "' + this.value + '"' +
      (this.language ? ', "@language": "' + this.language + '"' : '') +
      (this.type ? ', "@type": "' + this.type + '"' : '') +
      ' }';
    } else {
      return '{ "@id": "' + this.uri + '" }';
    }
  }
}
