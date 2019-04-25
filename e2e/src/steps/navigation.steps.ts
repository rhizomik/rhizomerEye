import { binding, given, when, then } from 'cucumber-tsflow';
import { expect } from 'chai';
import { browser } from 'protractor';
import { NavigationBar } from '../pages/navbar.page';
import { MainContentPage } from '../pages/main-content.page';

@binding()
class NavigationSteps {
  private navBar = new NavigationBar();
  private mainContent = new MainContentPage();

  @when(/^I go to the home page$/)
  async iGoToHomePage(): Promise<void> {
    await browser.get('http://localhost:4200');
  }

  @when(/^I click menu option "([^"]*)"$/)
  async iClickMenuOption (option: string): Promise<void> {
    await this.navBar.goToMenuOption(option);
  }

  @when(/^I click submenu option "([^"]*)" in menu "([^"]*)"$/)
  async iClickSubMenuOption (option: string, menu: string): Promise<void> {
    await this.navBar.goToMenuOption(menu);
    await this.navBar.goToMenuOption(option);
  }

  @when(/^I click the "([^"]*)" button$/)
  async iClickButton (text: string): Promise<void> {
    await this.mainContent.clickButtonWithText(text);
  }
}
export = NavigationSteps;
