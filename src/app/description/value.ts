import { UriUtils } from '../shared/uriutils';

export class Value {
  uri: string;
  label: string;
  value: string;
  language: string;

  constructor(value: any, context: Object = {}, labels: Map<string, string> = new Map()) {
    if (value['@value']) {
      this.value = value['@value'];
    } else if (value['@type']) {
      this.uri = UriUtils.expandUri(value['@value'], context);
      this.label = UriUtils.getLabel(this.uri, labels);
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
}
