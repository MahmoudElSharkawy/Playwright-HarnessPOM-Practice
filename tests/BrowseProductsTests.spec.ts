import { test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as allure from 'allure-js-commons';
import { ApisProducts } from '../src/apis/ApisProducts';
import { ProductsPage } from '../src/pages/ProductsPage';
import { ProductNavigationPage } from '../src/pages/ProductNavigationPage';
import { CategoryProductsPage } from '../src/pages/CategoryProductsPage';
import { BrandProductsPage } from '../src/pages/BrandProductsPage';
import { blockThirdPartyAdvertising } from '../src/utils/NetworkControls';

let testData: typeof import('../resources/testData/BrowseProductsTestJsonFile.json');
let apisProducts: ApisProducts;
let productsPage: ProductsPage;
let productNavigationPage: ProductNavigationPage;
let categoryProductsPage: CategoryProductsPage;
let brandProductsPage: BrandProductsPage;

test.describe('Story 88 — Browse Products by Category and Brand', () => {
  test('TC154: Validate main categories (Women, Men, Kids) and sub-categories are displayed in product navigation', async () => {
    await allure.feature('Story 88 — Browse Products by Category and Brand');
    await allure.story('ADO story 88');
    await allure.tms('154');
    const data = testData.tc154;
    await productsPage.navigate();
    await productsPage.verifyCatalog(data.expected.catalogHeading);
    await productNavigationPage.verifyNavigationVisible();
    await productNavigationPage.verifyMainCategories([data.women.name, data.men.name, data.kids.name]);
    await productNavigationPage.expandCategory(data.women.name);
    await productNavigationPage.verifyCategoryExpanded(data.women.name, data.women.subCategories);
    await productNavigationPage.expandCategory(data.men.name);
    await productNavigationPage.verifyCategoryExpanded(data.men.name, data.men.subCategories);
    await productNavigationPage.expandCategory(data.kids.name);
    await productNavigationPage.verifyCategoryExpanded(data.kids.name, data.kids.subCategories);
  });

  test('TC156: Validate available brands are displayed in the side navigation on the Products page', async () => {
    await allure.feature('Story 88 — Browse Products by Category and Brand');
    await allure.story('ADO story 88');
    await allure.tms('156');
    const data = testData.tc156;
    const brands = await apisProducts.listBrands();
    await apisProducts.verifyBrandListRead(brands, data.expected.api);
    await productsPage.navigate();
    await productsPage.verifyCatalog(data.expected.catalogHeading);
    await productNavigationPage.verifyNavigationVisible();
    await productNavigationPage.verifyBrandsListed(await apisProducts.getBrandNames(brands));
    await productNavigationPage.verifyBrandExamplesListed(data.brandExamples);
  });

  test('TC157: Verify selecting a brand displays products belonging to that specific brand', async () => {
    await allure.feature('Story 88 — Browse Products by Category and Brand');
    await allure.story('ADO story 88');
    await allure.tms('157');
    const data = testData.tc157;
    const catalog = await apisProducts.listProducts();
    await apisProducts.verifyCatalogRead(catalog, data.expected.api);
    await apisProducts.verifyBrandHasProducts(catalog, data.brand);
    await productsPage.navigate();
    await productsPage.verifyCatalog(data.expected.catalogHeading);
    await productNavigationPage.selectBrand(data.brand);
    await brandProductsPage.verifyArrival(data.brand);
    await brandProductsPage.verifyProductsListed(await apisProducts.getBrandProductIds(catalog, data.brand));
    await brandProductsPage.verifyHeading(data.expected.brandHeading);
  });

  test('TC159: Verify switching from a brand selection to a category selection updates product list', async () => {
    await allure.feature('Story 88 — Browse Products by Category and Brand');
    await allure.story('ADO story 88');
    await allure.tms('159');
    const data = testData.tc159;
    const catalog = await apisProducts.listProducts();
    await apisProducts.verifyCatalogRead(catalog, data.expected.api);
    await apisProducts.verifyBrandHasProducts(catalog, data.brand);
    await apisProducts.verifyCategoryHasProducts(catalog, data.category, data.subCategory);
    await apisProducts.verifyCategoryHasProductsOutsideBrand(catalog, data.category, data.subCategory, data.brand);
    await productsPage.navigate();
    await productsPage.verifyCatalog(data.expected.catalogHeading);
    await productNavigationPage.selectBrand(data.brand);
    await brandProductsPage.verifyHeading(data.expected.brandHeading);
    await brandProductsPage.verifyProductsListed(await apisProducts.getBrandProductIds(catalog, data.brand));
    await productNavigationPage.selectSubCategory(data.category, data.subCategory);
    await categoryProductsPage.verifyHeading(data.expected.categoryHeading);
    await categoryProductsPage.verifyProductsListed(await apisProducts.getCategoryProductIds(catalog, data.category, data.subCategory));
  });

  test('TC162: Verify navigating to Products page initially displays ALL PRODUCTS catalog', async () => {
    await allure.feature('Story 88 — Browse Products by Category and Brand');
    await allure.story('ADO story 88');
    await allure.tms('162');
    const data = testData.tc162;
    const catalog = await apisProducts.listProducts();
    await apisProducts.verifyCatalogRead(catalog, data.expected.api);
    await productsPage.navigate();
    await productsPage.verifyCatalog(data.expected.catalogHeading);
    await productsPage.verifyCatalogListed(await apisProducts.getProductIds(catalog));
  });

  test('TC167: Validate keyboard navigation for categories and brands in side menu', async () => {
    await allure.feature('Story 88 — Browse Products by Category and Brand');
    await allure.story('ADO story 88');
    await allure.tms('167');
    const data = testData.tc167;
    const catalog = await apisProducts.listProducts();
    await apisProducts.verifyCatalogRead(catalog, data.expected.api);
    await productsPage.navigate();
    await productsPage.verifyCatalog(data.expected.catalogHeading);
    const categoryOrder = await productNavigationPage.inspectCategoryKeyboardOrder([
      data.categories.women,
      data.categories.men,
      data.categories.kids,
    ]);
    await productNavigationPage.verifyKeyboardOrder(data.groups.categories, categoryOrder, data.expected.categoryOrder);
    await productNavigationPage.expandCategoryWithKeyboard(data.category);
    await productNavigationPage.verifyCategoryExpanded(data.category, data.subCategories);
    const subCategoryOrder = await productNavigationPage.inspectSubCategoryKeyboardOrder(data.category, data.subCategories);
    await productNavigationPage.verifyKeyboardOrder(data.groups.subCategories, subCategoryOrder, data.expected.subCategoryOrder);
    await productNavigationPage.selectSubCategoryWithKeyboard(data.category, data.selectedSubCategory);
    await categoryProductsPage.verifyHeading(data.expected.categoryHeading);
    await categoryProductsPage.verifyProductsListed(await apisProducts.getCategoryProductIds(catalog, data.category, data.selectedSubCategory));
    const brandOrder = await productNavigationPage.inspectBrandKeyboardOrder([data.brands.first, data.brands.second]);
    await productNavigationPage.verifyKeyboardOrder(data.groups.brands, brandOrder, data.expected.brandOrder);
    await productNavigationPage.selectBrandWithKeyboard(data.brands.second);
    await brandProductsPage.verifyHeading(data.expected.brandHeading);
    await brandProductsPage.verifyProductsListed(await apisProducts.getBrandProductIds(catalog, data.brands.second));
  });

  test.beforeAll(async () => {
    testData = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../resources/testData/BrowseProductsTestJsonFile.json'), 'utf8'),
    );
  });

  test.beforeEach('Block third-party advertising in the isolated test page', async ({ page }) => {
    await blockThirdPartyAdvertising(page);
  });

  test.beforeEach('Initialize services and page objects in the isolated test page', async ({ page, request }) => {
    apisProducts = new ApisProducts(request);
    productsPage = new ProductsPage(page);
    productNavigationPage = new ProductNavigationPage(page);
    categoryProductsPage = new CategoryProductsPage(page);
    brandProductsPage = new BrandProductsPage(page);
  });
});
