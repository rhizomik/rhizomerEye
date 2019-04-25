import { element, by, browser } from 'protractor';

export class UserFormPage {

  private form;
  private username;
  private password;

  constructor() {
    this.form = element(by.id('user-form'));
    this.username = this.form.element(by.id('username'));
    this.password = this.form.element(by.id('password'));
  }

  async fillUserForm(username: string, password: string) {
    await this.username.sendKeys(username);
    await this.password.sendKeys(password);
    return this.form.submit();
    // await browser.waitForAngular();
  }
}
