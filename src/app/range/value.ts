export class Value {
  value: string;
  count: number;
  uri: string;
  curie: string;
  label: string;
  selected = false;

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);

    if (!this.label) {
      if (this.curie) {
        this.label = this.curie.split(':')[1];
      } else {
        this.label = this.value.split('^^')[0];
      }
    }
  }
}
