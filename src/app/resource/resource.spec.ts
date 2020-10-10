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
      "body" : "\\n            <p>On the left there is an HTML rendering of my RDF profile made by <a href=\\"http://rhizomik.net\\">Rhizomer</a>.</p>\\n            <p>Paraphrasing my RDF profile: &quot;<em style=\\"font-style: italic;\\">My name is Roberto Garc&iacute;a. I'm <strong>Associate Professor</strong> at the <a target=\\"_blank\\" href=\\"http://www.diei.udl.es/\\"><strong>Computer Science and </strong></a></em><strong><em style=\\"font-style: italic;\\"><a target=\\"_blank\\" href=\\"http://www.diei.udl.es/\\">Engineering Department</a></em></strong><em style=\\"font-style: italic;\\"> of the <a target=\\"_blank\\" href=\\"http://www.udl.es/\\"><strong>Universitat de Lleida</strong></a>. You can reach me by telephone, mail or e-mail as specified</em>&quot;.</p>\\n            <p>Research stays (about 2 months each):</p>\\n            <ul>\\n                <li><strong>2019</strong>: Visiting Researcher at&nbsp;<a href=\\"https://www.blockchain-lab.org\\" target=\\"_blank\\"><strong>Blockchain Lab</strong></a>,&nbsp;<strong>Technical University of Delft</strong>, The Netherlands</li>\\n                <li><strong>2019</strong>: Visiting Scholar at <a href=\\"https://vsdesign.org/\\" target=\\"_blank\\"><strong>Value Sensitive Design Research Lab</strong></a>, Information School, <strong>University of Washington</strong>, Seattle, USA.</li>\\n                <li><strong>2018</strong>: Visiting Scholar at <a href=\\"https://www.business.auckland.ac.nz/en/about/od-our-departments/od-commercial-law.html\\" target=\\"_blank\\"><strong>Department of Commercial Law</strong></a>, Business School, <strong>University of Auckland</strong>, New Zealand.</li>\\n                <li><strong>2016</strong>: Visiting Reseacher at <strong><a href=\\"http://www.mn.uio.no/ifi/english/research/groups/logid/\\" target=\\"_blank\\">LogID</a></strong> - Logic &amp; Intelligent Data group,&nbsp;<strong>University of Oslo</strong>, Norway.</li>\\n                <li><strong>2014</strong> and&nbsp;<strong>2015</strong>:&nbsp;Visiting Scientist&nbsp;at&nbsp;<strong><a href=\\"http://haystack.csail.mit.edu\\" target=\\"_blank\\">Haystack group</a></strong>,&nbsp;<strong>Massachusetts Institute of Technology</strong>, USA.</li>\\n                <li><strong>2012</strong>:&nbsp;Visiting Associate Professor&nbsp;at&nbsp;<a target=\\"_blank\\" href=\\"http://hci.stanford.edu/\\" style=\\"font-weight: bold;\\">Stanford HCI group</a>,&nbsp;<strong>Stanford University</strong>, USA.</li>\\n                <li><strong>2009</strong>:&nbsp;Visiting Researcher&nbsp;at&nbsp;<strong><a href=\\"http://www.deri.ie/\\" target=\\"_blank\\">DERI</a>&nbsp;-</strong>&nbsp;<strong>Digital Enterprise Research Institute,</strong>&nbsp;Galway, Ireland.</li>\\n            </ul>\\n            <p>From&nbsp;2010 to 2018,&nbsp;<strong>director</strong>&nbsp;of the&nbsp;<a target=\\"_blank\\" href=\\"http://griho.udl.es/\\"><strong>GRIHO</strong></a><strong>&nbsp;Human-Computer Interaction and Data Integration Research Group</strong>, which is part of the&nbsp;<b>Polytechnic Institute of Research&nbsp;</b><b>and Innovation in Sustainability&nbsp;</b>(<b><a href=\\"http://inspires.udl.cat\\" target=\\"_blank\\">INSPIRES</a></b>).</p>\\n            <p>From&nbsp;2014&nbsp;to&nbsp;2017,&nbsp;<strong>part-time consultant</strong>&nbsp;at&nbsp;<a href=\\"http://www.cambridgesemantics.com\\"><strong>Cambridge Semantics</strong></a>, Boston, Massachusetts, USA.&nbsp;Consulting about semantic technologies to turn Big Data into Smart Data for business intelligence in domains like pharma and finance.</p>\\n            <p>From 2018 to 2019,&nbsp;<strong>part-time consultant</strong>&nbsp;at <a href=\\"https://jaak.io\\" target=\\"_blank\\"><strong>JAAK Music Ltd</strong></a>, London, UK.&nbsp;Combining semantics and blockchain technologies to build shared infrastructure to allow the music and media industries to collaborate on a global view of content ownership and rights.</p>\\n            <p>More details about projects, publications,... below&nbsp;as outlined in the <strong>Table of Contents</strong> on the right.</p>\\n            <p>Additionally:</p>\\n            <table width=\\"100%\\" border=\\"0\\" cellpadding=\\"1\\" cellspacing=\\"1\\">\\n                <tbody>\\n                    <tr>\\n                        <td style=\\"text-align: center;\\"><strong>Institutional Curriculum Vitae</strong><a href=\\"/html/~roberto/cv/CV-EN_RGarcia.pdf\\" target=\\"_blank\\"><img width=\\"16\\" height=\\"16\\" src=\\"/images/pdf.gif\\" alt=\\"CV PDF\\" /></a></td>\\n                        <td><a href=\\"http://es.linkedin.com/in/rogargon\\" target=\\"_blank\\"><img src=\\"/images/linkedin.png\\" width=\\"84\\" height=\\"20\\" border=\\"0\\" alt=\\"View Roberto Garcia's profile on LinkedIn\\" align=\\"absBottom\\" /></a></td>\\n                        <td><a href=\\"https://twitter.com/rogargon\\" target=\\"_blank\\"><img src=\\"/html/~roberto/images/follow-rogargon.png\\" width=\\"119\\" height=\\"20\\" alt=\\"Follow me on Twitter\\" /></a></td>\\n                        <td><iframe src=\\"http://ghbtns.com/github-btn.html?user=rogargon&amp;type=follow\\" allowtransparency=\\"true\\" frameborder=\\"0\\" scrolling=\\"0\\" width=\\"132\\" height=\\"20\\"></iframe></td>\\n                    </tr>\\n                </tbody>\\n            </table>\\n            ",
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
