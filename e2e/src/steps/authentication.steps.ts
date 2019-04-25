import { binding, given, when, then } from 'cucumber-tsflow';
import { expect } from 'chai';
import { NavigationBar } from '../pages/navbar.page';
import { LoginForm } from '../pages/login-form.page';

import NavigationSteps = require('./navigation.steps');

@binding()
class AuthenticationSteps {
  private navBar = new NavigationBar();
  private loginForm = new LoginForm();
  private navigationSteps = new NavigationSteps();

  @given(/^I sign in as "([^"]*)" with password "([^"]*)"$/)
  async iSignInAsWithPassword(username: string, password: string): Promise<void> {
    await this.navBar.clickSignin();
    await this.loginForm.signIn(username, password);
    await this.imSignedInAs(username);
  }

  @given(/^I'm signed in as "([^"]*)"$/)
  async imSignedInAs(username: string): Promise<void> {
    const signedInAs = await this.navBar.getCurrentUser();
    expect(signedInAs).to.equal(username);
  }

  @given(/^I log out$/)
  async iLogOut(): Promise<void> {
    await this.navBar.clickSignOut();
  }

  @given(/^I'm on the home page and logged out$/)
  async iMInHomePageLoggedOut(): Promise<void> {
    await this.navigationSteps.iGoToHomePage();
    if (await this.navBar.getCurrentUser() != null) {
      await this.iLogOut();
    }
  }
}
export = AuthenticationSteps;
