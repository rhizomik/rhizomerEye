export class Breadcrumb {
  name: string;
  uri: string;

  constructor(step: string, url: string) {
    this.name = decodeURI(step);
    this.uri = url.substring(0, url.indexOf(step)) + step;
  }
}
