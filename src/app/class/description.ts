import { Property } from './property';

export class Description {
  '@id': string;
  '@type': string;
  properties: Property[] = [];

  constructor(values: Object = {}) {
    Object.entries(values).forEach(
      ([key, value]) => {
        switch (key) {
          case '@id': { this['@id'] = value; break; }
          case '@type': { this['@type'] = value; break; }
          default: this.properties.push(new Property(key, value));
        }
      }
    );
  }
}
