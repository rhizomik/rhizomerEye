import { binding, given, when, then } from 'cucumber-tsflow';
import { expect } from 'chai';
import { ErrorAlert } from '../pages/error-alert.page';

@binding()
export class ErrorAlertSteps {
  private errorAlert = new ErrorAlert();

  @then(/^I see error alert "([^"]*)" and close it$/)
  async iSeeErrorAlert(errorMessage: string): Promise<void> {
    expect(await this.errorAlert.getMessage()).to.contain(errorMessage);
    await this.errorAlert.close();
  }
}
