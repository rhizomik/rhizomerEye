import { FacetDomain } from './facetDomain';
import { Labelled } from '../shared/labelled';

export class IncomingFacet extends Labelled {
  rangeUri: string;
  rangeCurie: string;
  uri: string;
  curie: string;
  uses: number;
  domains: FacetDomain[];

  constructor(values: Object = {}) {
    super(values);
  }
}
