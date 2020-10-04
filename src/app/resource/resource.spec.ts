import { Description } from '../description/description';
import { Resource } from './resource';
import { UriUtils } from '../shared/uriutils';
import { JsonLdParser } from 'jsonld-streaming-parser';
import { isomorphic } from 'rdf-isomorphic';

describe('Resource', () => {

  const jsonld1 = JSON.parse(`{
      "@context": {
        "foaf": "http://xmlns.com/foaf/0.1/",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "vcard": "http://www.w3.org/2006/vcard/ns#",
        "xsd": "http://www.w3.org/2001/XMLSchema#"
      },
      "@graph": [
        {
          "@id": "http://rhizomik.net/~roberto/",
          "@type": "http://swrc.ontoware.org/ontology#AssociateProfessor",
          "foaf:depiction": {
            "@id": "http://rhizomik.net/html/~roberto/images/Roberto_s.jpg"
          },
          "foaf:familyName": [ {
            "@language": "en",
            "@value": "Garcia"
            }, {
            "@language": "es",
            "@value": "García"
            }
          ],
          "foaf:givenName": "Roberto",
          "foaf:isPrimaryTopicOf": {
            "@id": "_:N836023f0efb04600b193f5b0fff07ca7"
          },
          "http://swrc.ontoware.org/ontology#affiliation": {
            "@id": "http://www.diei.udl.es"
          },
          "rdfs:label": [ {
            "@language": "en",
            "@value": "Roberto Garcia"
            }, {
            "@language": "es",
            "@value": "Roberto García"
            }
          ],
          "vcard:tel": {
            "@id": "_:Nd7d81db686664b3985de748c2d01d34b"
          },
          "foaf:birthDate": {
            "@type": "http://www.w3.org/2001/XMLSchema#gYear",
            "@value": "1976"
          }
        },
        {
          "@id": "_:N836023f0efb04600b193f5b0fff07ca7",
          "@type": "http://www.w3.org/2005/Atom/Content",
          "http://www.w3.org/2005/Atom/body": "<p>My name is <a href='http://rhizomik.net/'>Roberto</a></p>",
          "http://www.w3.org/2005/Atom/type": "text/html"
        },
        {
          "@id": "_:Nd7d81db686664b3985de748c2d01d34b",
          "@type": [
            "vcard:Work",
            "vcard:Voice"
          ],
          "rdf:value": "+34-973-702-742"
        }
      ]
    }`);

  it('should serialise back the input JSON-LD', async(done) => {
    const labels = Description.getLabels(jsonld1);
    const anonResources = Description.getAnonResources(jsonld1, labels);
    const resource: Resource = jsonld1['@graph']
      .filter(instance => UriUtils.expandUri(instance['@id'], jsonld1['@context']) === 'http://rhizomik.net/~roberto/')
      .map(instance => new Resource(instance, jsonld1['@context'], labels, anonResources))[0];

    const parserExpected = new JsonLdParser();
    const parserActual = new JsonLdParser();
    const graphExpected = [];
    const graphActual = [];
    parserExpected
      .on('data', quad => graphExpected.push(quad))
      .on('end', () => {
        parserActual.write(resource.asJsonLd());
        parserActual.end();
      });
    parserActual
      .on('data', quad => graphActual.push(quad))
      .on('end', () => {
        expect(graphExpected.length).toEqual(graphActual.length);
        expect(isomorphic(graphExpected, graphActual)).toBeTruthy();
        done();
      });
    parserExpected.write(JSON.stringify(jsonld1));
    parserExpected.end();
  });

});
