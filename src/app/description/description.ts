import { Property } from './property';
import { UriUtils } from '../shared/uriutils';

export class Description {
  '@id': string;
  '@type': string[];
  depiction: string;
  label: string;
  properties: Property[] = [];

  constructor(values: Object = {}, context: Object = {}) {
    Object.entries(values).forEach(
      ([key, value]) => {
        const expandedUri = UriUtils.expandUri(key, context);
        switch (expandedUri) {
          case '@id': {
            if ((<string>value).startsWith('_:')) { this['@id'] = null;
            } else { this['@id'] = UriUtils.expandUri(value, context); } break; }
          case '@type': { this['@type'] = this.processTypes(value); break; }
          case '@context': { break; }
          case 'http://www.w3.org/2000/01/rdf-schema#label': {
            if (value['@language']) { this.label = value['@value']; } else { this.label = value; }
            break;
          }
          case 'http://xmlns.com/foaf/0.1/depiction': {
            if (value['@id']) { this.depiction = value['@id']; } else { this.depiction = value; }
            break; }
          default: if (expandedUri.indexOf('wikiPage') < 0) {
            this.properties.push(new Property(expandedUri, value, context));
          }
        }
      }
    );
    this.properties = this.properties.sort((a, b) => a.label.localeCompare(b.label));
  }

  static isOfType(types: any, classUri: string, context: Object): boolean {
    if (types instanceof Array) {
      return (<Array<string>>types.map(value => UriUtils.expandUri(value, context))).includes(classUri);
    } else {
      return UriUtils.expandUri(<string>types, context) === classUri;
    }
  }

  processTypes(value: any): string[] {
    if (value instanceof Array) {
      return value.map((url: string) => this.localName(url));
    } else {
      return [this.localName(value)];
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
