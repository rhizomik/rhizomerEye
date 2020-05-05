export class Dataset {
  id: string;
  public = false;
  owner: string;
  queryType = 'OPTIMIZED';
  inferenceEnabled = false;
  sampleSize: number;
  coverage: number;

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
  }
}
