import { Property } from './property';
import { Value } from './value';
import { UriUtils } from '../shared/uriutils';

const RDF_TYPE_URI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

export class Description {
  '@id': string;
  '@type': Value[] = [];
  properties: Property[] = [];
  label: string;
  labels: Value[] = [];
  depiction: Value[] = [];
  topicOf: Value[] = [];

  constructor(values: Object = {}, context: Object = {}, labels: Map<string, any> = new Map(), prefLang = 'en') {
    Object.entries(values).forEach(
      ([key, value]) => {
        const expandedUri = UriUtils.expandUri(key, context);
        switch (expandedUri) {
          case '@id': {
            if ((<string>value).startsWith('_:')) { this['@id'] = value;
            } else { this['@id'] = UriUtils.expandUri(value, context); } break; }
          case '@type': { this['@type'] = this.processTypes(value, context, labels, prefLang); break; }
          case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': {
            this['@type'] = this.processTypes(value, context, labels, prefLang); break; }
          case '@context': { break; }
          case 'http://www.wikidata.org/prop/direct/P18':
          case 'http://xmlns.com/foaf/0.1/depiction': {
            this.depiction = Value.getValues(key, value, context, labels, prefLang); break; }
          case 'http://xmlns.com/foaf/0.1/isPrimaryTopicOf': {
            this.topicOf = Value.getValues(key, value, context, labels, prefLang); break; }
          default:
            this.properties.push(new Property(key, value, context, labels, prefLang));
        }
      }
    );
    this.label = this.pickLabel(this.properties, prefLang);
    this.properties = this.properties.sort((a, b) => a.label.localeCompare(b.label));
  }

  static isOfType(types: any, classUri: string, context: Object): boolean {
    if (types instanceof Array) {
      return (<Array<string>>types.map(value => UriUtils.expandUri(value, context))).includes(classUri);
    } else if (types['@id']) {
      return UriUtils.expandUri(types['@id'], context) === classUri;
    } else {
      return UriUtils.expandUri(<string>types, context) === classUri;
    }
  }

  static getAnonResources(jsonld: Object, labels: Map<string, Value> = new Map(), prefLang = 'en')
    : Map<string, Description> {
    const anonResources: Map<string, Description> = new Map<string, Description>();
    jsonld['@graph'].filter(instance => (<string>instance['@id']).startsWith('_:'))
      .map(instance =>
        anonResources.set(instance['@id'], new Description(instance, jsonld['@context'], labels, prefLang)));
    return anonResources;
  }

  static getResources(jsonld: Object,labels: Map<string, Value> = new Map(), prefLang = 'en'): Description[] {
    return jsonld['@graph']
      .map(instance => new Description(instance, jsonld['@context'], labels, prefLang));
  }

  static getTypedResources(jsonld: Object,labels: Map<string, Value> = new Map(), prefLang = 'en'): Description[] {
    return jsonld['@graph']
      .filter(instance => instance['@type'] || instance['rdf:type'] || instance[RDF_TYPE_URI])
      .map(instance => new Description(instance, jsonld['@context'], labels, prefLang));
  }

  static getResourcesOfType(jsonld: Object, type: string, labels: Map<string, Value> = new Map(), prefLang = 'en')
    : Description[] {
    return jsonld['@graph']
      .filter(instance =>
        instance['@type'] && Description.isOfType(instance['@type'], type, jsonld['@context']) ||
        instance['rdf:type'] && Description.isOfType(instance['rdf:type'], type, jsonld['@context']) ||
        instance[RDF_TYPE_URI] && Description.isOfType(instance[RDF_TYPE_URI], type, jsonld['@context']))
      .map(instance =>
        new Description(instance, jsonld['@context'], labels, prefLang));
  }

  static getLabels(jsonld: Object): Map<string, any> {
    const labels: Map<string, any> = new Map<string, any>();
    if (jsonld['@graph']) {
      jsonld['@graph'].map(instance =>
        Object.entries(instance).forEach(([key, value]) => {
          if (key.includes('label')) {
            labels.set(
              UriUtils.expandUri(instance['@id'], jsonld['@context']), value);
          }
        }));
    } else if (jsonld['label'] && jsonld['@id']) {
      labels.set(UriUtils.expandUri(jsonld['@id'], jsonld['@context']), jsonld['label']);
    }
    return labels;
  }

  private pickLabel(properties: Property[], prefLang: string): string {
    let selection: Property[];
    for (const option of [
      'http://www.w3.org/2004/02/skos/core#prefLabel', 'http://www.w3.org/2000/01/rdf-schema#label',
      'http://xmlns.com/foaf/0.1/name', 'https://schema.org/name',
      'http://schema.org/name', 'http://purl.org/dc/terms/title', 'http://purl.org/dc/elements/1.1/title']) {
      selection = properties.filter(p => p.uri === option);
      if (selection.length) {
        break;
      }
    }
    return selection.length ?
      UriUtils.pickLabel(selection[0].values.map(
        value => ({'@language': value.language, '@value': value.value})), prefLang)
      : undefined;
  }

  processTypes(value: any, context: Object = {}, labels: Map<string, Value> = new Map(), prefLang = 'en')
    : Value[] {
    if (value instanceof Array) {
      return value.map((url: string) => new Value('@type', url, context, labels, prefLang));
    } else {
      return [new Value('@type', value, context, labels, prefLang)];
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
        this['@type'].map(value => '"' + value.uri + '"').join(', ') + ']';
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
