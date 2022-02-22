import { Value } from './value';

export class Range {
  id: string;
  uri: string;
  label: string;
  timesUsed: number;
  differentValues: number;
  curie: string;
  relation: boolean;
  values: Value[];
  expanded: boolean;

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
  }

  static searchRange = new Range({ uri: 'http://www.w3.org/2001/XMLSchema#string', curie: 'xsd:string' });
}
