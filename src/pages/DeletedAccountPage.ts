import { type Page, type Locator } from '@playwright/test';
import { step } from 'allure-js-commons';
import { applications } from '../config/applications';
import { expectToHaveText, expectToHaveURL, expectToBeVisible, expectToBeHidden } from '../utils/Expects';

export class DeletedAccountPage {
  readonly page: Page;
  readonly url = `${applications.app.url}/delete_account`;
  // Locators
  private readonly deleted_header: Locator;
  private readonly continue_link: Locator;

  constructor(page: Page) {
    this.page = page;
    this.deleted_header = page.getByRole('heading', { name: 'Account Deleted!', exact: true });
    this.continue_link = page.getByRole('link', { name: 'Continue', exact: true });
  }

  ///// Actions
  async continueToApplication(): Promise<void> {
    await step('Continue from Account Deleted', async () => this.continue_link.click());
  }

  ///// Validations
  async verifyDeleted(expectedMessage: string): Promise<void> {
    await step(`Verify account confirmation: ${expectedMessage}`, async () => {
      await expectToHaveURL(this.page, this.url);
      await expectToHaveText('the account-deleted confirmation', this.deleted_header, expectedMessage, {
        ignoreCase: true,
      });
      await expectToBeVisible('Continue', this.continue_link);
    });
  }

  async verifyConfirmationLeft(): Promise<void> {
    await step('Verify Continue leaves the deletion confirmation', async () => {
      await expectToBeHidden('the account-deleted confirmation', this.deleted_header);
    });
  }
}
