import { Endpoint } from './endpoint';

export class Dataset {
  id: string;
  public = false;
  owner: string;
  queryType = 'OPTIMIZED';
  inferenceEnabled = false;
  sampleSize: number;
  coverage: number;
  endpoint: Endpoint;

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
  }
}
