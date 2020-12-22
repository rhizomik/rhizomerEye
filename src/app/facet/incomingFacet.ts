import { FacetDomain } from './facetDomain';

export class IncomingFacet {
  uri: string;
  label: string;
  curie: string;
  uses: number;
  domains: FacetDomain[];

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
  }
}
