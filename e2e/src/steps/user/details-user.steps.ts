import { binding, given, when, then } from 'cucumber-tsflow';
import { expect } from 'chai';
import { UserDetailsPage } from '../../pages/user/user-details.page';

@binding()
class DetailsUserSteps {
  private userDetails = new UserDetailsPage();

  @then(/^I see a user with name "([^"]*)"$/)
  async iSeeUserWithName(name: string): Promise<void> {
    expect(await this.userDetails.getUsername()).to.equal(name);
  }

  @then(/^I see a user with e-mail "([^"]*)"$/)
  async iSeeUserWithEMail(email: string): Promise<void> {
    expect(await this.userDetails.getEMail()).to.equal(email);
  }
}
export = DetailsUserSteps;
