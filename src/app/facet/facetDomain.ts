
export class FacetDomain {
  uri: string;
  label: string;
  curie: string;
  count: number;

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
  }
}
