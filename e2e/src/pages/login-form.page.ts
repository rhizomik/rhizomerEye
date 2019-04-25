import { element, by, browser } from 'protractor';

export class LoginForm {

  private form;
  private usernameInput;
  private passwordInput;

  constructor() {
    this.form = element(by.id('login-form'));
    this.usernameInput = element(by.id('username'));
    this.passwordInput = element(by.id('password'));
  }

  async signIn(username: string, password: string): Promise<void> {
    await this.usernameInput.sendKeys(username);
    await this.passwordInput.sendKeys(password);
    await this.form.submit();
    await browser.waitForAngular();
  }
}
