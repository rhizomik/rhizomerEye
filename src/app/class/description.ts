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
          case '@id': { this['@id'] = value; break; }
          case '@type': { this['@type'] = value; break; }
          case 'label': { this.label = value; break; }
          case 'depiction': {
            if (context['depiction']['@id'] === 'http://xmlns.com/foaf/0.1/depiction') { this.depiction = value; }
            break;
          }
          default: this.properties.push(new Property(key, value));
        }
      }
    );
  }
}
