import { Facet } from '../facet/facet';
import { Value } from '../range/value';

export class Filter {
  classId: string;
  facet: Facet;
  value: Value;

  constructor(classId: string, facet: Facet, value: Value) {
    this.classId = classId;
    this.facet = facet;
    this.value = value;
  }
}
