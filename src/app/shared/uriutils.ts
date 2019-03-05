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

  static expandUri(input: string, context: Object): string {
    if (this.isUrl(input) || input.startsWith('urn:')) {
      return input;
    } else if (!input.startsWith('_:') && input.split(':').length === 2) {
      const ns = input.split(':')[0];
      const base = context[ns]['@id'] ? context[ns]['@id'] : context[ns];
      return base + input.split(':').slice(1);
    } else if (context[input]) {
      return context[input]['@id'];
    } else {
      return input;
    }
  }

  static isUrl(str): boolean {
    const pattern = new RegExp('(?:(?:https?|ftp|file):\\/\\/|www\\.|ftp\\.)' +
      '(?:\\([-A-Z0-9+&@#\\/%=~_|$?!:,.]*\\)|' +
      '[-A-Z0-9+&@#\\/%=~_|$?!:,.])*(?:\\([-A-Z0-9+&@#\\/%=~_|$?!:,.]*\\)|' +
      '[A-Z0-9+&@#\\/%=~_|$])', 'i');
    return pattern.test(str);
  }
}
