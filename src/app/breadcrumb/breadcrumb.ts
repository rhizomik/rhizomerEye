export class Breadcrumb {
  name: string;
  uri: string;

  constructor(step: string, url: string) {
    this.name = decodeURIComponent(step);
    if (this.name.startsWith('resource?uri=')) {
      this.name = this.name.substring('resource?uri='.length);
    } else if (this.name.startsWith('edit-resource?uri=')) {
      this.name = this.name.substring('edit-resource?uri='.length);
    }
    this.uri = decodeURI(url.substring(0, url.indexOf(step)) + step);
  }
}
