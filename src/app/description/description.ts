import { Property } from './property';
import { Value } from './value';
import { UriUtils } from '../shared/uriutils';

export class Description {
  '@id': string;
  '@type': Value[] = [];
  properties: Property[] = [];
  label: string;
  labels: Value[] = [];
  depiction: Value[] = [];
  topicOf: Value[] = [];

  constructor(values: Object = {}, context: Object = {}, labels: Map<string, string> = new Map()) {
    Object.entries(values).forEach(
      ([key, value]) => {
        const expandedUri = UriUtils.expandUri(key, context);
        switch (expandedUri) {
          case '@id': {
            if ((<string>value).startsWith('_:')) { this['@id'] = value;
            } else { this['@id'] = UriUtils.expandUri(value, context); } break; }
          case '@type': { this['@type'] = this.processTypes(value, context); break; }
          case '@context': { break; }
          case 'http://www.w3.org/2000/01/rdf-schema#label': {
            this.labels = Value.getValues(value, context, labels);
            this.label = UriUtils.pickLabel(value, 'en'); break; }
          case 'http://xmlns.com/foaf/0.1/depiction': {
            this.depiction = Value.getValues(value, context, labels); break; }
          case 'http://xmlns.com/foaf/0.1/isPrimaryTopicOf': {
            this.topicOf = Value.getValues(value, context, labels); break; }
          default: // if (expandedUri.indexOf('wikiPage') < 0) {
            this.properties.push(new Property(expandedUri, value, context, labels));
          // }
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

  static getAnonResources(jsonld: Object, labels: Map<string, string> = new Map()): Map<string, Description> {
    const anonResources: Map<string, Description> = new Map<string, Description>();
    jsonld['@graph'].filter(instance => (<string>instance['@id']).startsWith('_:'))
      .map(instance => anonResources.set(instance['@id'], new Description(instance, jsonld['@context'], labels)));
    return anonResources;
  }

  static getResourcesOfType(jsonld: Object, type: string, labels: Map<string, string> = new Map()): Description[] {
    return jsonld['@graph']
      .filter(instance => instance['@type'] && Description.isOfType(instance['@type'], type, jsonld['@context']))
      .map(instance => new Description(instance, jsonld['@context'], labels));
  }

  static getLabels(jsonld: Object): Map<string, string> {
    const labels: Map<string, string> = new Map<string, string>();
    if (jsonld['@graph']) {
      jsonld['@graph'].map(instance =>
        Object.entries(instance).forEach(([key, value]) => {
          if (key.includes('label')) {
            labels.set(UriUtils.expandUri(instance['@id'], jsonld['@context']), <string>value);
          }
        }));
    } else if (jsonld['label'] && jsonld['@id']) {
      labels.set(UriUtils.expandUri(jsonld['@id'], jsonld['@context']), <string>jsonld['label']);
    }
    return labels;
  }

  processTypes(value: any, context: Object = {}, labels: Map<string, string> = new Map()): Value[] {
    if (value instanceof Array) {
      return value.map((url: string) => new Value(url, context, labels));
    } else {
      return [new Value(value, context, labels)];
    }
  }

  isAnon() {
    if (this['@id'] && this['@id'].startsWith('_:')) {
      return true;
    }
    return false;
  }

  asJsonLd(): string {
    let jsonld = '{\n';
    jsonld += '\t "@id": "' + this['@id'] + '"';
    if (this['@type']) {
      jsonld += ',\n\t "@type": [' +
        this['@type'].map(value => '"' + value.uri + '"').join('", "') + ']';
    }
    if (this.labels.length) {
      jsonld += ',\n\t "http://www.w3.org/2000/01/rdf-schema#label": [ ' +
        this.labels.map(value => value.asJsonLd()).join(', ') + ' ]';
    }
    if (this.depiction.length) {
      jsonld += ',\n\t "http://xmlns.com/foaf/0.1/depiction": [' +
        this.depiction.map(value => value.asJsonLd()).join(', ') + ']';
    }
    if (this.topicOf.length) {
      jsonld += ',\n\t "http://xmlns.com/foaf/0.1/isPrimaryTopicOf": [' +
        this.topicOf.map(value => value.asJsonLd()).join(', ') + ']';
    }
    jsonld += this.properties.map(property =>
      ',\n\t "' + property.uri + '": [' + property.values.map(value => value.asJsonLd()).join(', ') + ']'
    ).join('');
    return jsonld + '\n }';
  }
}
