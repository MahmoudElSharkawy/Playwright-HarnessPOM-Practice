import { type Page, type Locator } from '@playwright/test';
import { step } from 'allure-js-commons';
import { focusByTab, tabSequence } from '../utils/KeyboardActions';
import { clickUntilRevealed } from '../utils/UiControls';
import {
  expectToBeVisible, expectToHaveText, expectToHaveAttributeSet,
  expectAllToBeVisibleAndEnabled, expectToEqual,
} from '../utils/Expects';

// Routeless skeleton area: the Category and Brands panels render on the Products, category and
// brand pages and have no direct entry of their own (page-classes practice 3 exception).
export class ProductNavigationPage {
  readonly page: Page;
  // Locators
  private readonly category_header: Locator;
  private readonly brands_header: Locator;
  private readonly categories_section: Locator;
  private readonly mainCategories_link: Locator;
  private readonly brands_link: Locator;

  constructor(page: Page) {
    this.page = page;
    // Stable markup confirmed through the owned browser's public DOM inspection.
    this.category_header = page.getByRole('heading', { name: 'Category', exact: true });
    this.brands_header = page.getByRole('heading', { name: 'Brands', exact: true });
    this.categories_section = page.locator('#accordian');
    this.mainCategories_link = this.categories_section.locator('.panel-title a');
    this.brands_link = page.locator('.brands-name a');
  }

  private mainCategory_link(category: string): Locator {
    return this.categories_section.locator(`.panel-title a[href="#${category}"]`);
  }

  private subCategories_list(category: string): Locator {
    return this.page.locator(`#${category}`);
  }

  private subCategory_link(category: string, subCategory: string): Locator {
    return this.subCategories_list(category).getByRole('link', { name: subCategory, exact: true });
  }

  private brand_link(brand: string): Locator {
    return this.page.locator(`.brands-name a[href="/brand_products/${brand}"]`);
  }

  ///// Actions

  async expandCategory(category: string): Promise<void> {
    await step(`Expand the ${category} category`, async () =>
      clickUntilRevealed(this.mainCategory_link(category), this.subCategories_list(category)),
    );
  }

  async selectSubCategory(category: string, subCategory: string): Promise<void> {
    await step(`Select the ${subCategory} sub-category under ${category}`, async () => {
      await this.expandCategory(category);
      await this.subCategory_link(category, subCategory).click();
    });
  }

  async selectBrand(brand: string): Promise<void> {
    await step(`Select the ${brand} brand`, async () => this.brand_link(brand).click());
  }

  async inspectCategoryKeyboardOrder(categories: string[]): Promise<boolean[]> {
    return step('Move keyboard focus through the main categories', async () =>
      tabSequence(this.page, categories.map(category => this.mainCategory_link(category))),
    );
  }

  async expandCategoryWithKeyboard(category: string): Promise<void> {
    await step(`Reach and expand the ${category} category with the keyboard`, async () => {
      await focusByTab(this.page, this.mainCategory_link(category));
      await this.mainCategory_link(category).press('Enter');
    });
  }

  async inspectSubCategoryKeyboardOrder(category: string, subCategories: string[]): Promise<boolean[]> {
    return step(`Move keyboard focus through the ${category} sub-categories`, async () =>
      tabSequence(this.page, subCategories.map(subCategory => this.subCategory_link(category, subCategory))),
    );
  }

  async selectSubCategoryWithKeyboard(category: string, subCategory: string): Promise<void> {
    await step(`Activate the ${subCategory} sub-category under ${category} with the keyboard`, async () => {
      await focusByTab(this.page, this.subCategory_link(category, subCategory));
      await this.subCategory_link(category, subCategory).press('Enter');
    });
  }

  async inspectBrandKeyboardOrder(brands: string[]): Promise<boolean[]> {
    return step('Move keyboard focus through the brands', async () =>
      tabSequence(this.page, brands.map(brand => this.brand_link(brand))),
    );
  }

  async selectBrandWithKeyboard(brand: string): Promise<void> {
    await step(`Activate the ${brand} brand with the keyboard`, async () => {
      await focusByTab(this.page, this.brand_link(brand));
      await this.brand_link(brand).press('Enter');
    });
  }

  ///// Validations

  async verifyNavigationVisible(): Promise<void> {
    await step('Verify the product navigation shows the Category and Brands panels', async () => {
      await expectToBeVisible('the Category panel heading', this.category_header);
      await expectToBeVisible('the Brands panel heading', this.brands_header);
      await expectToBeVisible('the category accordion', this.categories_section);
    });
  }

  async verifyMainCategories(expectedCategories: string[]): Promise<void> {
    await step('Verify the main categories are displayed', async () => {
      await expectToHaveText('the main categories', this.mainCategories_link, expectedCategories);
      await expectAllToBeVisibleAndEnabled('the main categories', this.mainCategories_link);
    });
  }

  async verifyCategoryExpanded(category: string, expectedSubCategories: string[]): Promise<void> {
    await step(`Verify the ${category} category reveals its sub-categories`, async () => {
      await expectToBeVisible(`the ${category} sub-category list`, this.subCategories_list(category));
      await expectToHaveText(`the ${category} sub-categories`, this.subCategories_list(category).getByRole('link'), expectedSubCategories);
    });
  }

  async verifyBrandsListed(expectedBrands: string[]): Promise<void> {
    await step('Verify the Brands section lists every available brand', async () =>
      expectToHaveAttributeSet('the brand links', this.brands_link, 'href', expectedBrands.map(brand => `/brand_products/${brand}`)),
    );
  }

  async verifyBrandExamplesListed(exampleBrands: string[]): Promise<void> {
    await step(`Verify the Brands section lists ${exampleBrands.join(', ')}`, async () =>
      expectToHaveText(
        'the example brand links',
        this.brands_link.filter({ hasText: new RegExp(`^\\s*\\(\\d+\\)\\s*(${exampleBrands.join('|')})\\s*$`) }),
        exampleBrands.map(brand => new RegExp(`^\\s*\\(\\d+\\)\\s*${brand}\\s*$`)),
      ),
    );
  }

  async verifyKeyboardOrder(controlGroup: string, proof: boolean[], expectedOrder: boolean[]): Promise<void> {
    await step(`Verify keyboard focus reaches all ${expectedOrder.length} ${controlGroup} in order`, async () => {
      expectToEqual(`the ${controlGroup} keyboard focus order`, proof, expectedOrder);
    });
  }
}
