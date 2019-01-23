export class Value {
  value: string;
  count : number;
  curie: string;
  label: string;

  constructor(values: Object = {}) {
    this.value = values['value'];
    this.count = values['count'];
    this.curie = values['curie'];
    this.label = values['label'];

    if (!this.label) {
      if (this.curie) {
        this.label = this.curie;
      } else {
        this.label = this.value;
      }
    }
  }
}
