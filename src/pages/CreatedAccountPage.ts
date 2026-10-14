import { type Page, type Locator } from '@playwright/test';
import { step } from 'allure-js-commons';
import { applications } from '../config/applications';
import {
  expectToHaveText,
  expectToHaveURL,
  expectToBeVisible,
  expectToBeEnabled,
  expectToBeInViewport,
} from '../utils/Expects';

export class CreatedAccountPage {
  readonly page: Page;
  readonly url = `${applications.app.url}/account_created`;
  // Locators
  private readonly created_header: Locator;
  private readonly continue_link: Locator;

  constructor(page: Page) {
    this.page = page;
    this.created_header = page.getByRole('heading', { name: 'Account Created!', exact: true });
    this.continue_link = page.getByRole('link', { name: 'Continue', exact: true });
  }

  ///// Actions
  async continueToApplication(): Promise<void> {
    await step('Continue from Account Created', async () => this.continue_link.click());
  }

  async reachMobileConfirmation(): Promise<void> {
    await step('Reach Account Created and Continue on the small viewport', async () => {
      await this.created_header.scrollIntoViewIfNeeded();
      await this.continue_link.scrollIntoViewIfNeeded();
    });
  }

  ///// Validations
  async verifyCreated(expectedMessage: string): Promise<void> {
    await step(`Verify account confirmation: ${expectedMessage}`, async () => {
      await expectToHaveURL(this.page, this.url);
      await expectToHaveText('the account-created confirmation', this.created_header, expectedMessage, {
        ignoreCase: true,
      });
      await expectToBeVisible('Continue', this.continue_link);
    });
  }

  async verifyMobileConfirmation(expectedMessage: string): Promise<void> {
    await step('Verify Account Created and Continue are reachable on mobile', async () => {
      await expectToHaveText('the account-created confirmation', this.created_header, expectedMessage, {
        ignoreCase: true,
      });
      await expectToBeVisible('the confirmation', this.created_header);
      await expectToBeInViewport('the confirmation', this.created_header);
      await expectToBeVisible('Continue', this.continue_link);
      await expectToBeInViewport('Continue', this.continue_link);
      await expectToBeEnabled('Continue', this.continue_link);
    });
  }
}
