import { element, by, browser, ExpectedConditions, ElementFinder } from 'protractor';

export class ErrorAlert {

  private errorAlert: ElementFinder;
  private errorAlertClose: ElementFinder;

  constructor() {
    this.errorAlert = element(by.css('.alert'));
    this.errorAlertClose = this.errorAlert.element(by.css('button.close'));
  }

  async getMessage() {
    return this.errorAlert.getText();
  }

  async close() {
    await this.errorAlertClose.click();
  }
}
