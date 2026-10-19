import { type Page, type Locator } from '@playwright/test';
import { step } from 'allure-js-commons';
import { applications } from '../config/applications';
import { gotoInteractive } from '../utils/UiControls';
import { expectToHaveText, expectToHaveURL, expectToBeVisible } from '../utils/Expects';

export class PaymentPage {
  readonly page: Page;
  readonly url = `${applications.app.url}/payment`;
  // Locators
  private readonly payment_header: Locator;

  constructor(page: Page) {
    this.page = page;
    this.payment_header = page.getByRole('heading', { name: 'Payment', exact: true });
  }

  ///// Actions
  async navigate(): Promise<void> {
    await step('Navigate to Payment with the authenticated checkout cart', async () => gotoInteractive(this.page, this.url));
  }

  ///// Validations
  async verifyPaymentStep(expectedHeading: string): Promise<void> {
    await step(`Verify the ${expectedHeading} step opens`, async () => {
      await expectToHaveURL(this.page, this.url);
      await expectToHaveText('the payment heading', this.payment_header, expectedHeading);
      await expectToBeVisible('the payment heading', this.payment_header);
    });
  }
}
