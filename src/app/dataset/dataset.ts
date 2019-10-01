export class Dataset {
  id: string;
  sparqlEndPoint: string;
  updateEndPoint: string;
  public = false;
  owner: string;
  queryType = 'OPTIMIZED';
  inferenceEnabled = false;
  sampleSize: number;
  coverage: number;
  username: string;
  password: string;
  graphs: string[];
  serverGraphs: string[];

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
  }
}
