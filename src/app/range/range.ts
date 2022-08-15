import { Value } from './value';
import { Labelled } from '../shared/labelled';

export class Range extends Labelled {
  id: string;
  uri: string;
  timesUsed: number;
  differentValues: number;
  curie: string;
  relation: boolean;
  values: Value[];
  expanded: boolean;

  constructor(values: Object = {}) {
    super(values);
  }

  static searchRange = new Range({ uri: 'http://www.w3.org/2001/XMLSchema#string', curie: 'xsd:string' });
}
