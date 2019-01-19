export class Breadcrumb {
  name: string;
  uri: string;

  constructor(step: string, url: string) {
    this.name = decodeURI(step.charAt(0).toUpperCase() + step.slice(1));
    this.uri = url.substring(0, url.indexOf(step)) + step;
  }
}
