export class Labelled {
  value: string;
  curie: string;
  labels = {};
  defaultLabel: string;

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
    if (this.curie) {
      this.defaultLabel = this.curie.split(':')[1];
    } else {
      this.defaultLabel = this.value.split('^^')[0];
    }
  }

  getLabel(lang: string): string {
    if (!lang || !Object.keys(this.labels).length) {
      return this.defaultLabel;
    } else if (this.labels[lang]) {
      return this.labels[lang][0];
    } else if (this.labels["undefined"]) {
      return this.labels["undefined"][0];
    } else if (this.labels["en"]) {
      return this.labels["en"][0];
    }
    return this.defaultLabel;
  }
}
