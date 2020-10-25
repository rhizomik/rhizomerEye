import { Property } from '../description/property';
import { Description } from '../description/description';

export class Resource extends Description {
  anonResources: Map<string, Description>;
  anonBody: Property;

  constructor(values: Object = {}, context: Object = {}, labels: Map<string, string> = new Map(),
              anonResources: Map<string, Description> = new Map()) {
    super(values, context, labels);
    this.anonResources = anonResources;
    if (this.topicOf.length > 0 && this.topicOf[0].asString().startsWith('_:')) {
      const anon: Description = anonResources.get(this.topicOf[0].asString());
      anon.properties.filter(property => property.uri === 'http://www.w3.org/2005/Atom/body')
        .forEach(property => {
        this.anonBody  = property;
      });
    }
  }

  asJsonLd(): string {
    let jsonld = '{ "@graph": [\n';
    jsonld += super.asJsonLd();
    this.anonResources.forEach(anonResource => jsonld += ', ' + anonResource.asJsonLd());
    return jsonld + '\n ] }';
  }

  combine(addition: Resource) {
    addition.anonResources.forEach((value, key) => this.anonResources.set(key, value));
    this.depiction = this.depiction.concat(addition.depiction);
    this.labels = this.labels.concat(addition.labels);
    this.properties = this.properties.concat(addition.properties);
  }
}
