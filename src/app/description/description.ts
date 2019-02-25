import { Property } from './property';

export class Description {
  '@id': string;
  '@type': string[];
  depiction: string;
  label: string;
  properties: Property[] = [];

  constructor(values: Object = {}, context: Object = {}) {
    Object.entries(values).forEach(
      ([key, value]) => {
        const expandedUri = Description.expandUri(key, context);
        switch (expandedUri) {
          case '@id': {
            if ((<string>value).startsWith('_:')) { this['@id'] = null;
            } else { this['@id'] = value; } break; }
          case '@type': { this['@type'] = this.processTypes(value); break; }
          case '@context': { break; }
          case 'http://www.w3.org/2000/01/rdf-schema#label': {
            if (value['@language']) { this.label = value['@value']; } else { this.label = value; }
            break;
          }
          case 'http://xmlns.com/foaf/0.1/depiction': {
            if (value['@id']) { this.depiction = value['@id']; } else { this.depiction = value; }
            break; }
          default: this.properties.push(new Property(expandedUri, value));
        }
      }
    );
    this.properties = this.properties.sort((a, b) => a.label.localeCompare(b.label));
  }

  static expandUri(input: string, context: Object) {
    if (input.startsWith('http:') || input.startsWith('urn:')) {
      return input;
    } else if (input.split(':').length === 2) {
      const ns = input.split(':')[0];
      const base = context[ns]['@id'] ? context[ns]['@id'] : context[ns];
      return base + input.split(':').slice(1);
    } else if (context[input]) {
      return context[input]['@id'];
    } else {
      return input;
    }
  }

  static isOfType(types: any, classUri: string, context: Object): boolean {
    if (types instanceof Array) {
      return (<Array<string>>types.map(value => this.expandUri(value, context))).includes(classUri);
    } else {
      return Description.expandUri(<string>types, context) === classUri;
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
