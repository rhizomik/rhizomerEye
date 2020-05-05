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
  serverGraphs: string[];

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
  }
}
