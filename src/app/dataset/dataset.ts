export class Dataset {
  id: string;
  sparqlEndPoint: string;
  updateEndPoint: string;
  queryType: string;
  inferenceEnabled = false;
  sampleSize: number;
  coverage: number;
  username: string;

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
  }
}
