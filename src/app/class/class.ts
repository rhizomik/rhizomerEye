export class Class {
  id: string;
  uri: string;
  label: string;
  instanceCount: number;
  curie: string;

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
  }
}
