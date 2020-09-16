import { Facet } from '../facet/facet';
import { Range } from '../range/range';

export class Filter {
  classId: string;
  facet: Facet;
  range: Range;
  value: string;

  constructor(classId: string, facet: Facet, range: Range, value: string) {
    this.classId = classId;
    this.facet = facet;
    this.range = range;
    this.value = value;
  }
}
