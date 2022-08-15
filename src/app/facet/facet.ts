import { Range } from '../range/range';
import { Labelled } from '../shared/labelled';

export class Facet extends Labelled {
  id: string;
  uri: string;
  range: string;
  curie: string;
  relation: boolean;
  timesUsed: number;
  differentValues: number;
  ranges: Range[];
  selected: boolean;
  domainURI: string;

  constructor(values: Object = {}) {
    super(values);
  }

  static searchFacet = new Facet({ uri: 'urn:rhz:contains', label: '', curie: 'rhz:contains' });
}
