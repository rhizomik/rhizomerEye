import { Endpoint } from './endpoint';

export class Dataset {
  id: string;
  public = false;
  owner: string;
  queryType = 'DETAILED';
  endpoint: Endpoint;

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
  }
}
