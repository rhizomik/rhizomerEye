export class Endpoint {
  id: number;
  type = 'GENERIC';
  queryEndPoint: string;
  queryUsername: string;
  queryPassword: string;
  writable: boolean;
  updateEndPoint: string;
  updateUsername: string;
  updatePassword: string;
  graphs: string[];
  ontologies: string[];
  serverGraphs: string[];
  timeout = 300000;

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
  }
}
