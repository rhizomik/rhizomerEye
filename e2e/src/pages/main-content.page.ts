import { element, by, browser } from 'protractor';

export class MainContentPage {

  private mainContainer;

  constructor() {
    this.mainContainer = element(by.css('main.container'));
  }

  async clickLinkWithText(text: string): Promise<void> {
    await this.mainContainer.element(by.partialLinkText(text)).click();
    await browser.waitForAngular();
  }

  async clickButtonWithText(text: string): Promise<void> {
    await this.mainContainer.element(by.partialButtonText(text)).click();
    await browser.waitForAngular();
  }
}
