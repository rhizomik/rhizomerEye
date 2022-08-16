export class Labelled {
  uri: string;
  value: string;
  curie: string;
  labels = {};
  defaultLabel: string;

  constructor(values: Object = {}) {
    Object.assign(<any>this, values);
    if (this.curie) {
      this.defaultLabel = this.curie.split(':')[1];
    } else if (this.uri) {
      this.defaultLabel = this.uri.split('^^')[0];
    } else if (this.value) {
      this.defaultLabel = this.value.split('^^')[0];
    }
  }

  getLabel(lang: string): string {
    if (!Object.keys(this.labels).length) {
      return this.defaultLabel;
    } else if (lang && this.labels[lang]) {
      return this.labels[lang];
    } else if (lang && Object.keys(this.labels).some(code => code.indexOf(lang) === 0)) {
      const code = Object.keys(this.labels).find(code => code.indexOf(lang) === 0);
      return this.labels[code];
    } else if (this.labels["undefined"]) {
      return this.labels["undefined"];
    } else if (this.labels["en"]) {
      return this.labels["en"];
    }
    return this.defaultLabel;
  }
}
