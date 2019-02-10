import { Property } from './property';

export class Description {
  '@id': string;
  '@type': string;
  depiction: string;
  label: string;
  properties: Property[] = [];

  constructor(values: Object = {}, context: Object = {}) {
    Object.entries(values).forEach(
      ([key, value]) => {
        switch (key) {
          case '@id': {
            if ((<string>value).startsWith('_:')) { this['@id'] = null;
            } else { this['@id'] = value; } break; }
          case '@type': { this['@type'] = this.processTypes(value); break; }
          case '@context': { break; }
          case 'label': {
            if (value['@language']) { this.label = value['@value']; } else { this.label = value; }
            break;
          }
          case 'depiction': {
            if (context['depiction']['@id'] === 'http://xmlns.com/foaf/0.1/depiction') { this.depiction = value; }
            break;
          }
          default: this.properties.push(new Property(key, value));
        }
      }
    );
  }

  processTypes(value: any): string {
    if (value instanceof Array) {
      return value.map((url: string) => this.localName(url)).join(', ');
    } else {
      return this.localName(value);
    }
  }

  localName(url: string): string {
    if (url.indexOf('#') > 0) {
      return url.substring(url.lastIndexOf('#') + 1);
    } else if (url.indexOf('/') > 0) {
      return url.substring(url.lastIndexOf('/') + 1);
    } else {
      return url;
    }
  }
}
