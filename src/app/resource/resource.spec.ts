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

  const jsonld2 = JSON.parse(`{
    "@graph" : [ {
      "@id" : "_:b0",
      "@type" : "http://www.w3.org/2006/vcard/ns#Internet",
      "value" : "roberto@rhizomik.net"
    }, {
      "@id" : "_:b1",
      "@type" : [ "http://www.w3.org/2006/vcard/ns#Work", "http://www.w3.org/2006/vcard/ns#Voice" ],
      "value" : "+34-973-702-742"
    }, {
      "@id" : "_:b2",
      "@type" : "http://www.w3.org/2005/Atom/Content",
      "body" : " <p>My profile</table> ",
      "type" : "text/html"
    }, {
      "@id" : "_:b3",
      "@type" : "http://www.w3.org/2006/vcard/ns#Work",
      "country-name" : "ES",
      "locality" : "Lleida",
      "postal-code" : "E-25001",
      "street-address" : "Jaume II, 69"
    }, {
      "@id" : "http://rhizomik.net/~roberto/",
      "@type" : "http://swrc.ontoware.org/ontology#AssociateProfessor",
      "affiliation" : "http://www.diei.udl.es",
      "label" : "Roberto García",
      "adr" : "_:b3",
      "email" : "_:b0",
      "tel" : "_:b1",
      "depiction" : "http://rhizomik.net/html/~roberto/images/Roberto_s.jpg",
      "family_name" : "García",
      "givenname" : "Roberto",
      "isPrimaryTopicOf" : "_:b2",
      "nick" : "rogargon"
    } ],
    "@context" : {
      "value" : {
        "@id" : "http://www.w3.org/1999/02/22-rdf-syntax-ns#value"
      },
      "body" : {
        "@id" : "http://www.w3.org/2005/Atom/body"
      },
      "type" : {
        "@id" : "http://www.w3.org/2005/Atom/type"
      },
      "isPrimaryTopicOf" : {
        "@id" : "http://xmlns.com/foaf/0.1/isPrimaryTopicOf",
        "@type" : "@id"
      },
      "tel" : {
        "@id" : "http://www.w3.org/2006/vcard/ns#tel",
        "@type" : "@id"
      },
      "email" : {
        "@id" : "http://www.w3.org/2006/vcard/ns#email",
        "@type" : "@id"
      },
      "givenname" : {
        "@id" : "http://xmlns.com/foaf/0.1/givenname"
      },
      "depiction" : {
        "@id" : "http://xmlns.com/foaf/0.1/depiction",
        "@type" : "@id"
      },
      "label" : {
        "@id" : "http://www.w3.org/2000/01/rdf-schema#label"
      },
      "adr" : {
        "@id" : "http://www.w3.org/2006/vcard/ns#adr",
        "@type" : "@id"
      },
      "nick" : {
        "@id" : "http://xmlns.com/foaf/0.1/nick"
      },
      "affiliation" : {
        "@id" : "http://swrc.ontoware.org/ontology#affiliation",
        "@type" : "@id"
      },
      "family_name" : {
        "@id" : "http://xmlns.com/foaf/0.1/family_name"
      },
      "postal-code" : {
        "@id" : "http://www.w3.org/2006/vcard/ns#postal-code"
      },
      "street-address" : {
        "@id" : "http://www.w3.org/2006/vcard/ns#street-address"
      },
      "country-name" : {
        "@id" : "http://www.w3.org/2006/vcard/ns#country-name"
      },
      "locality" : {
        "@id" : "http://www.w3.org/2006/vcard/ns#locality"
      }
    }
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

  it('should serialise back the input JSON-LD with id context', async(done) => {
    const labels = Description.getLabels(jsonld2);
    const anonResources = Description.getAnonResources(jsonld2, labels);
    const resource: Resource = jsonld2['@graph']
      .filter(instance => UriUtils.expandUri(instance['@id'], jsonld2['@context']) === 'http://rhizomik.net/~roberto/')
      .map(instance => new Resource(instance, jsonld2['@context'], labels, anonResources))[0];

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
    parserExpected.write(JSON.stringify(jsonld2));
    parserExpected.end();
  });

});
