
export class Relation {
  classUri: string;
  classLabel: string;
  classCurie: string;
  propertyUri: string;
  propertyLabel: string;
  propertyCurie: string;
  rangeUri: string;
  rangeLabel: string;
  rangeCurie: string;
  uses: number;

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
  }
}
