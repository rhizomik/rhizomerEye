import { element, by, browser } from 'protractor';

export class UserDetailsPage {

  private details;
  private detailsTitle;
  private detailsUsername;
  private detailsEMail;
  private detailsRole;
  private listBtn;
  private editBtn;
  private deleteBtn;

  constructor() {
    this.details = element(by.css('div.card'));
    this.detailsTitle = this.details.element(by.css('div.card-title'));
    this.detailsUsername = this.details.all(by.css('p.card-text')).get(0);
    this.detailsEMail = this.details.all(by.css('p.card-text')).get(1);
    this.detailsRole = this.details.all(by.css('p.card-text')).get(2);
    this.listBtn = this.details.element(by.id('listBtn'));
    this.editBtn = this.details.element(by.id('editBtn'));
    this.deleteBtn = this.details.element(by.id('deleteBtn'));
  }

  async getUsername(): Promise<string> {
    return this.detailsUsername.getText();
  }

  async getEMail(): Promise<string> {
    return this.detailsEMail.getText();
  }

  async getRole(): Promise<string> {
    return this.detailsRole.getText();
  }

  async clickBackToListButton() {
    await this.listBtn.click();
  }

  async clickEditButton() {
    await this.editBtn.click();
  }

  async clickDeleteButton() {
    await this.deleteBtn.click();
  }
}
