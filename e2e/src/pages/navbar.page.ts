import { element, by, browser, ExpectedConditions } from 'protractor';

export class NavigationBar {
  private navbar;
  private login;
  private logout;
  private currentUser;
  private home;

  constructor() {
    this.navbar = element(by.css('nav.navbar'));
    this.login = this.navbar.element(by.linkText('Login'));
    this.logout = this.navbar.element(by.linkText('Logout'));
    this.currentUser = this.navbar.element(by.id('currentUser'));
    this.home = this.navbar.element(by.className('navbar-brand'));
  }

  async clickSignin() {
    await browser.wait(ExpectedConditions.presenceOf(this.login));
    await this.login.click();
  }

  async clickSignOut() {
    await this.logout.click();
  }

  async goToMenuOption(option: string) {
    await this.navbar.element(by.linkText(option)).click();
  }

  async getCurrentUser(): Promise<string> {
    if (await this.currentUser.isPresent()) {
      return this.currentUser.getText();
    }
    return null;
  }

  async isMenuOptionPresent(option: string): Promise<boolean> {
    return this.navbar.element(by.linkText(option)).isPresent();
  }
}
