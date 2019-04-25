import { element, by, browser } from 'protractor';

export class ConfirmPage {

  private confirmBtn;
  private cancelBtn;

  constructor() {
    this.confirmBtn = element(by.id('yes'));
    this.cancelBtn = element(by.id('cancel'));
  }

  async clickConfirmButton(): Promise<void> {
    await this.confirmBtn.click();
    await browser.waitForAngular();
  }

  async clickCancelButton(): Promise<void> {
    await this.cancelBtn.click();
    await browser.waitForAngular();
  }
}
