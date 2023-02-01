import { Labelled } from '../shared/labelled';

export class Class extends Labelled {
  id: string;
  uri: string;
  instanceCount: number;
  facetsCount: number;
  curie: string;

  constructor(values: Object = {}) {
    super(values);
  }
}
