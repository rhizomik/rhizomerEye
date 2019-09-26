import { element, by, browser } from 'protractor';

export class MainContentPage {

  private mainContainer;

  constructor() {
    this.mainContainer = element(by.css('main.container'));
  }

  async clickLinkWithText(text: string) {
    await this.mainContainer.element(by.partialLinkText(text)).click();
  }

  async clickButtonWithText(text: string) {
    await this.mainContainer.element(by.partialButtonText(text)).click();
  }
}
