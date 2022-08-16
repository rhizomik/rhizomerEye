import { Labelled } from '../shared/labelled';

export class FacetDomain extends Labelled {
  uri: string;
  curie: string;
  count: number;

  constructor(values: Object = {}) {
    super(values);
  }
}
