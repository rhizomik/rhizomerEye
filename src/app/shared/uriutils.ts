import { Value } from '../description/value';

export class UriUtils {

  static localName(uri: string): string {
    if (uri.endsWith('/')) {
      uri = uri.substring(0, uri.length - 1);
    }
    if (uri.indexOf('#') > 0) {
      return uri.substring(uri.lastIndexOf('#') + 1);
    } else if (uri.indexOf('/') > 0) {
      return uri.substring(uri.lastIndexOf('/') + 1);
    } else {
      return uri;
    }
  }

  static getLabel(uri: string, labels: Map<string, any>, prefLang: string): string {
    if (labels.has(uri)) {
      const label = this.pickLabel(labels.get(uri), prefLang);
      if (label && label.length) {
        return label;
      }
    }
    return UriUtils.localName(uri);
  }

  static pickLabel(value: any, prefLang: string): string {
    if (value instanceof Array) {
      const preferred = value
        .filter(label => label['@language'] && label['@language'].indexOf(prefLang) === 0)
        .map(label => label['@value'] || label)[0];
      const noLang = value.filter(label => !label['@language']).map(label => label['@value'] || label)[0];
      const defaultLang = value.map(label => label['@value'] || label)[0];
      return preferred || noLang || defaultLang;
    } else if (value['@value']) {
      return value['@value'];
    } else {
      return value;
    }
  }

  static expandUri(input: string, context: Object): string {
    if (this.isUrl(input) || input.startsWith('urn:')) {
      return input;
    } else if (!input.startsWith('_:') && input.match(/\S+:\S+/)) {
      const ns = input.split(':')[0];
      if (context[ns]) {
        const base = context[ns]['@id'] ? context[ns]['@id'] : context[ns];
        return base + input.split(':').slice(1);
      }
    } else if (context[input]) {
      return context[input]['@id'];
    }
    return input;
  }

  static isUrl(str): boolean {
    const pattern = new RegExp('^(?:(?:https?|ftp|file|mailto|tel):)' +
      '(?:\\([-A-Z0-9+&@#\\/%=~_|$?!:,.]*\\)|' +
      '[-A-Z0-9+&@#\\/%=~_|$?!:,.])*(?:\\([-A-Z0-9+&@#\\/%=~_|$?!:,.]*\\)|' +
      '[A-Z0-9+&@#\\/%=~_|$])', 'i');
    return pattern.test(str);
  }
}
