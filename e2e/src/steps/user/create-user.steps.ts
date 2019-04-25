import { binding, given, when, then } from 'cucumber-tsflow';
import { UserFormPage } from '../../pages/user/user-form.page';
import { UserListPage } from '../../pages/user/user-list.page';

@binding()
class CreateUserSteps {
  private userForm = new UserFormPage();
  private userList = new UserListPage();

  @when(/^I fill the user form with username "([^"]*)" and password "([^"]*)"$/)
  async createUserWithUsernameEmailPassword(username: string, password: string) {
    await this.userForm.fillUserForm(username, password);
  }
}
export = CreateUserSteps;
