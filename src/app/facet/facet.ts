import { Range } from '../range/range';

export class Facet {
  id: string;
  uri: string;
  label: string;
  range: string;
  curie: string;
  relation: boolean;
  timesUsed: number;
  differentValues: number;
  ranges: Range[];
  selected: boolean;
  domainURI: string;

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
  }

  static searchFacet = new Facet({ uri: 'urn:rhz:contains', label: '', curie: 'rhz:contains' });
}
