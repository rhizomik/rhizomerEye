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
    return await this.detailsUsername.getText();
  }

  async getEMail(): Promise<string> {
    return await this.detailsEMail.getText();
  }

  async getRole(): Promise<string> {
    return await this.detailsRole.getText();
  }

  async clickBackToListButton(): Promise<void> {
    await this.listBtn.click();
    await browser.waitForAngular();
  }

  async clickEditButton(): Promise<void> {
    await this.editBtn.click();
    await browser.waitForAngular();
  }

  async clickDeleteButton(): Promise<void> {
    await this.deleteBtn.click();
    await browser.waitForAngular();
  }
}
