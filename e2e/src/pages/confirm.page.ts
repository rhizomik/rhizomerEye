import { element, by, browser } from 'protractor';

export class ConfirmPage {

  private confirmBtn;
  private cancelBtn;

  constructor() {
    this.confirmBtn = element(by.id('yes'));
    this.cancelBtn = element(by.id('cancel'));
  }

  async clickConfirmButton() {
    await this.confirmBtn.click();
  }

  async clickCancelButton() {
    await this.cancelBtn.click();
  }
}
