import { Facet } from '../facet/facet';

export class Filter {
  classId: string;
  facet: Facet;
  value: string;

  constructor(classId: string, facet: Facet, value: string) {
    this.classId = classId;
    this.facet = facet;
    this.value = value;
  }
}
