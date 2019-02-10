export class Property {
  uri: string;
  label: string;
  values: any[] = [];

  constructor(uri: string, value: any) {
    this.uri = uri;
    this.label = this.localName(uri);
    if (value instanceof Array) {
      this.values = value.map(v => this.processPropertyValue(v));
    } else {
      this.values.push(this.processPropertyValue(value));
    }
  }

  processPropertyValue(value: any): any {
    if (value['@language']) {
      return value['@value'];
    } else if (value['@id']) {
      return value['@id'];
    } else {
      return value;
    }
  }

  localName(uri: string): string {
    if (uri.indexOf('#') > 0) {
      return uri.substring(uri.lastIndexOf('#') + 1);
    } else if (uri.indexOf('/') > 0) {
      return uri.substring(uri.lastIndexOf('/') + 1);
    } else {
      return uri;
    }
  }
}
