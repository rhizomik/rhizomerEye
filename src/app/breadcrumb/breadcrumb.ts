export class Breadcrumb {
  name: string;
  uri: string;

  constructor(step: string, url: string) {
    this.name = decodeURIComponent(step);
    if (this.name.includes('?uri=')) {
      this.name = this.name.split('?uri=')[1];
    } else if (this.name.includes('?')) {
      this.name = this.name.split('?')[0];
    }
    this.uri = decodeURI(url.substring(0, url.indexOf(step)) + step);
  }

  static toString(breadcrumbs: Breadcrumb[]): string {
    return breadcrumbs
      .filter((breadcrumb: Breadcrumb) => breadcrumb.name !== 'datasets')
      .map((breadcrumb: Breadcrumb) => breadcrumb.name).join(' / ');
  }
}
