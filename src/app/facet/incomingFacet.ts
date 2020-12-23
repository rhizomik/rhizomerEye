import { FacetDomain } from './facetDomain';

export class IncomingFacet {
  rangeUri: string;
  rangeCurie: string;
  uri: string;
  label: string;
  curie: string;
  uses: number;
  domains: FacetDomain[];

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
  }
}
