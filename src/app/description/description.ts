import { Property } from './property';
import { UriUtils } from '../shared/uriutils';

export class Description {
  '@id': string;
  '@type': string[];
  depiction: string;
  topicOf: string;
  label: string;
  properties: Property[] = [];

  constructor(values: Object = {}, context: Object = {}, labels: Map<string, string> = new Map()) {
    Object.entries(values).forEach(
      ([key, value]) => {
        const expandedUri = UriUtils.expandUri(key, context);
        switch (expandedUri) {
          case '@id': {
            if ((<string>value).startsWith('_:')) { this['@id'] = null;
            } else { this['@id'] = UriUtils.expandUri(value, context); } break; }
          case '@type': { this['@type'] = this.processTypes(value, context); break; }
          case '@context': { break; }
          case 'http://www.w3.org/2000/01/rdf-schema#label': {
            this.label = UriUtils.pickLabel(value, 'en'); break; }
          case 'http://xmlns.com/foaf/0.1/depiction': {
            if (value['@id']) { this.depiction = value['@id']; } else { this.depiction = value; } break; }
          case 'http://xmlns.com/foaf/0.1/isPrimaryTopicOf': {
            if (value['@id']) { this.topicOf = value['@id']; } else { this.topicOf = value; } break; }
          default: if (expandedUri.indexOf('wikiPage') < 0) {
            this.properties.push(new Property(expandedUri, value, context, labels));
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

  processTypes(value: any, context: Object): string[] {
    if (value instanceof Array) {
      return value.map((url: string) => UriUtils.expandUri(url, context));
    } else {
      return [UriUtils.expandUri(value, context)];
    }
  }
}
