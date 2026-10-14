import { type Page, type Locator } from '@playwright/test';
import { step } from 'allure-js-commons';
import { applications } from '../config/applications';
import { gotoInteractive } from '../utils/UiControls';
import { expectToBeVisible, expectToBeEnabled } from '../utils/Expects';

export class ProductsPage {
  readonly page: Page;
  readonly url = `${applications.app.url}/products`;
  // Locators
  private readonly search_input: Locator;
  private readonly search_button: Locator;
  private readonly continueShopping_button: Locator;

  constructor(page: Page) {
    this.page = page;
    this.search_input = page.getByRole('textbox', { name: 'Search Product', exact: true });
    this.search_button = page.getByRole('button', { name: '', exact: true });
    this.continueShopping_button = page.getByRole('button', { name: 'Continue Shopping', exact: true });
  }

  private addToCart_button(productName: string): Locator {
    return this.page
      .locator('.product-image-wrapper')
      .filter({ has: this.page.getByText(productName, { exact: true }) })
      .locator('.productinfo')
      .getByText('Add to cart', { exact: true });
  }

  ///// Actions
  async navigate(): Promise<void> {
    await step('Navigate to Products', async () => gotoInteractive(this.page, this.url));
  }

  async searchProducts(term: string): Promise<void> {
    await step(`Search products for ${term}`, async () => {
      await this.search_input.fill(term);
      await this.search_button.click();
    });
  }

  async addProductToCart(productName: string): Promise<void> {
    await step(`Add ${productName} to the cart`, async () => {
      await this.addToCart_button(productName).click();
      await this.continueShopping_button.click();
    });
  }
  ///// Validations
  async verifyProductAvailable(productName: string): Promise<void> {
    await step(`Verify ${productName} can be added to the cart`, async () => {
      await expectToBeVisible('the product Add to cart action', this.addToCart_button(productName));
      await expectToBeEnabled('the product Add to cart action', this.addToCart_button(productName));
    });
  }
}
