import { test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as allure from 'allure-js-commons';
import { ProductsPage } from '../src/pages/ProductsPage';

let testData: typeof import('../resources/testData/ProductSearchTestJsonFile.json');
let productsPage: ProductsPage;

test.describe('Story 87 — Search the Product Catalog', () => {
  test('TC134: Verify Product Search Input and Action are Displayed on Products Page', async () => {
    await allure.feature('Story 87 — Search the Product Catalog');
    await allure.story('ADO story 87');
    await allure.tms('134');
    const data = testData.tc134;
    await productsPage.navigate();
    await productsPage.verifyCatalog(data.expected.catalogHeading);
    await productsPage.verifySearchControls();
  });

  test('TC135: Validate SEARCHED PRODUCTS Section Appears After Successful Search', async () => {
    await allure.feature('Story 87 — Search the Product Catalog');
    await allure.story('ADO story 87');
    await allure.tms('135');
    const data = testData.tc135;
    await productsPage.navigate();
    await productsPage.verifyCatalog(data.expected.catalogHeading);
    await productsPage.verifySearchControls();
    await productsPage.verifySearchInput(data.expected.initialSearch);
    await productsPage.enterSearchTerm(data.term);
    await productsPage.verifySearchInput(data.term);
    await productsPage.submitSearch();
    await productsPage.verifySearchedProducts(data.expected.searchedHeading);
  });

  test('TC144: Validate Product Search Displays in Responsive Layout (Mobile)', async () => {
    await allure.feature('Story 87 — Search the Product Catalog');
    await allure.story('ADO story 87');
    await allure.tms('144');
    const data = testData.tc144;
    await productsPage.navigateOnMobile(data.viewport);
    await productsPage.verifyCatalog(data.expected.catalogHeading);
    await productsPage.reachSearchControls();
    await productsPage.verifySearchControls();
    await productsPage.verifySearchInput(data.expected.initialSearch);
    await productsPage.verifyMobileSearchLayout();
    await productsPage.searchProducts(data.term);
    await productsPage.verifySearchedProducts(data.expected.searchedHeading);
    await productsPage.reachSearchResults();
    await productsPage.verifyMobileResults();
    const previousY = await productsPage.scrollResults(data.scrollDistance);
    await productsPage.verifyResultsScrolled(previousY);
  });

  test('TC146: Validate Search with Empty Search Term Returns All Products (Regression)', async () => {
    await allure.feature('Story 87 — Search the Product Catalog');
    await allure.story('ADO story 87');
    await allure.tms('146');
    const data = testData.tc146;
    await productsPage.navigate();
    await productsPage.verifyCatalog(data.expected.catalogHeading);
    await productsPage.verifySearchControls();
    const initialCatalog = await productsPage.getCatalogProductDestinations();
    await productsPage.enterSearchTerm(data.term);
    await productsPage.verifySearchInput(data.term);
    await productsPage.submitSearch();
    await productsPage.verifyCatalogRestored(initialCatalog, new RegExp(data.expected.emptySearchHeadingPattern));
  });

  test('TC152: Validate Search Input Field Placeholder Text', async () => {
    await allure.feature('Story 87 — Search the Product Catalog');
    await allure.story('ADO story 87');
    await allure.tms('152');
    const data = testData.tc152;
    await productsPage.navigate();
    await productsPage.verifyCatalog(data.expected.catalogHeading);
    await productsPage.verifySearchControls();
    await productsPage.verifySearchInput(data.expected.initialSearch);
    await productsPage.verifySearchPlaceholder(data.expected.placeholder);
    await productsPage.enterSearchTerm(data.typingSample);
    await productsPage.verifyPlaceholderReplaced(data.typingSample);
  });

  test.beforeAll(async () => {
    testData = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../resources/testData/ProductSearchTestJsonFile.json'), 'utf8'),
    );
  });

  test.beforeEach('Initialize Products in the isolated test page', async ({ page }) => {
    productsPage = new ProductsPage(page);
  });
});
