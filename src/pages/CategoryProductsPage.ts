import { type Page, type Locator } from '@playwright/test';
import { step } from 'allure-js-commons';
import { applications } from '../config/applications';
import { gotoInteractive } from '../utils/UiControls';
import { expectToHaveText, expectToHaveAttributeSet } from '../utils/Expects';

export class CategoryProductsPage {
  readonly page: Page;
  readonly url = `${applications.app.url}/category_products`;
  // Locators
  private readonly categoryProducts_header: Locator;
  private readonly productDetails_link: Locator;

  constructor(page: Page) {
    this.page = page;
    this.categoryProducts_header = page.getByRole('heading', { name: /Products$/ });
    this.productDetails_link = page.locator('.product-image-wrapper').getByRole('link', { name: /View Product$/ });
  }

  ///// Actions
  async navigate(categoryId: number): Promise<void> {
    await step(`Navigate to the category ${categoryId} products`, async () => gotoInteractive(this.page, `${this.url}/${categoryId}`));
  }

  ///// Validations
  async verifyHeading(expectedHeading: string): Promise<void> {
    await step(`Verify the category page heading is ${expectedHeading}`, async () =>
      expectToHaveText('the category products heading', this.categoryProducts_header, expectedHeading),
    );
  }

  async verifyProductsListed(expectedProductIds: number[]): Promise<void> {
    await step('Verify only the sub-category products are listed', async () =>
      expectToHaveAttributeSet(
        'the listed sub-category product destinations',
        this.productDetails_link,
        'href',
        expectedProductIds.map(id => `/product_details/${id}`),
      ),
    );
  }
}
