import { Property } from '../description/property';
import { Description } from '../description/description';

export class Resource extends Description {
  '@id': string;
  '@type': string[];
  depiction: string;
  topicOf: string;
  body: string;
  label: string;
  properties: Property[];
  anonResources: Map<string, Description>;

  constructor(values: Object = {}, context: Object = {}, labels: Map<string, string> = new Map(),
              anonResources: Map<string, Description> = new Map()) {
    super(values, context, labels);
    this.anonResources = anonResources;
    if (this.topicOf && this.topicOf.startsWith('_:') && anonResources.has(this.topicOf)) {
      const anon: Description = anonResources.get(this.topicOf);
      anon.properties.filter(property => property.uri === 'http://www.w3.org/2005/Atom/body')
        .forEach(property => {
          this.body = property.values[0].value;
        });
    }
  }
}
