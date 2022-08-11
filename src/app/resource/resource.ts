import { Property } from '../description/property';
import { Description } from '../description/description';

export class Resource extends Description {
  anonResources: Map<string, Description>;
  anonBody: Property;

  constructor(values: Object = {}, context: Object = {}, labels: Map<string, any> = new Map(),
              anonResources: Map<string, Description> = new Map(), prefLabel: string = 'en') {
    super(values, context, labels, prefLabel);
    this.anonResources = anonResources;
    if (this.topicOf.length > 0 && this.topicOf[0].asString().startsWith('_:')) {
      const anon: Description = anonResources.get(this.topicOf[0].asString());
      anon?.properties.filter(property => property.uri === 'http://www.w3.org/2005/Atom/body')
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

  asSchemaOrgJsonLd(): string {
    let jsonld = '{ "@context": "https://schema.org", "@graph": [\n';
    jsonld += super.asJsonLd();
    this.anonResources.forEach(anonResource => jsonld += ', ' + anonResource.asJsonLd());
    jsonld = jsonld.replace(/https?:\/\/schema\.org\//gi, '');
    return jsonld + '\n ] }';
  }

  combine(addition: Resource) {
    addition.anonResources.forEach((value, key) => this.anonResources.set(key, value));
    this.depiction = this.depiction.concat(addition.depiction);
    this.labels = this.labels.concat(addition.labels);
    addition.properties.forEach(property => {
      const present = this.properties.filter(existing => existing.uri === property.uri);
      if (present.length) {
        present[0].values.concat(property.values);
      } else {
        this.properties.push(property);
      }
    });
    this.properties = this.properties.sort((a, b) => a.label.localeCompare(b.label));
  }
}
