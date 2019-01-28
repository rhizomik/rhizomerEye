export class Property {
  name: string;
  value: any;

  constructor(name: string, value: any) {
    this.name = name;
    if (value['@language']) {
      this.value = value['@value'];
    } else {
      this.value = value;
    }
  }
}
