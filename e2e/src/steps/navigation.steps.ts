import { binding, given, when, then } from 'cucumber-tsflow';
import { expect } from 'chai';
import { browser, by } from 'protractor';
import { NavigationBar } from '../pages/navbar.page';
import { MainContentPage } from '../pages/main-content.page';

@binding()
class NavigationSteps {
  private navBar = new NavigationBar();
  private mainContent = new MainContentPage();

  @when(/^I go to the home page$/)
  async iGoToHomePage() {
    await browser.get('http://localhost:4200');
  }

  @when(/^I click menu option "([^"]*)"$/)
  async iClickMenuOption (option: string) {
    await this.navBar.goToMenuOption(option);
  }

  @when(/^I click submenu option "([^"]*)" in menu "([^"]*)"$/)
  async iClickSubMenuOption (option: string, menu: string) {
    await this.navBar.goToMenuOption(menu);
    await this.navBar.goToMenuOption(option);
  }

  @when(/^I click the "([^"]*)" button$/)
  async iClickButton (text: string) {
    await this.mainContent.clickButtonWithText(text);
  }

  @then(/^The menu option "([^"]*)" is not visible$/)
  async MenuOptionNotVisible (text: string) {
    expect(await this.navBar.isMenuOptionPresent(text)).to.equal(false);
  }
}
export = NavigationSteps;
