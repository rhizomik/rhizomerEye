export class Breadcrumb {
  name: string;
  uri: string;

  constructor(step: string, url: string) {
    this.name = decodeURIComponent(step);
    if (this.name.startsWith('describe?uri=')) {
      this.name = this.name.substring('describe?uri='.length);
    }
    this.uri = url.substring(0, url.indexOf(step)) + step;
  }
}
