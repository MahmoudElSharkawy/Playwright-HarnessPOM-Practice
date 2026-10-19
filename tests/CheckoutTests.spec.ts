import { test } from '@playwright/test';
import * as fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import * as allure from 'allure-js-commons';
import { ApisCustomers } from '../src/apis/ApisCustomers';
import { HeaderPage } from '../src/pages/HeaderPage';
import { LoginPage } from '../src/pages/LoginPage';
import { ProductsPage } from '../src/pages/ProductsPage';
import { CartPage } from '../src/pages/CartPage';
import { CheckoutPage } from '../src/pages/CheckoutPage';
import { PaymentPage } from '../src/pages/PaymentPage';
import { blockThirdPartyAdvertising } from '../src/utils/NetworkControls';

let testData: typeof import('../resources/testData/CheckoutTestJsonFile.json');
let apisCustomers: ApisCustomers | undefined;
let attemptedCustomer: { email: string; password: string } | undefined;
let headerPage: HeaderPage;
let loginPage: LoginPage;
let productsPage: ProductsPage;
let cartPage: CartPage;
let checkoutPage: CheckoutPage;
let paymentPage: PaymentPage;
const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '') + '-' + randomUUID().slice(0, 8);

// Disposable account passwords are entered through the UI; omit protocol traces.
test.use({ trace: 'off' });

test.describe("Story 91 — Proceed to Checkout and Review Delivery, Billing and Order Details", () => {
  // Account provisioning and the multi-page checkout journey exceed the default minute.
  test.describe.configure({ timeout: 180_000 });

  test("TC174: Validate unauthenticated user is prompted to register/login when proceeding to checkout", async () => {
    await allure.feature("Story 91 — Proceed to Checkout and Review Delivery, Billing and Order Details");
    await allure.story('ADO story 91');
    await allure.tms('174');
    const data = testData.tc174;
    await productsPage.navigate();
    await productsPage.searchProducts(data.product);
    await productsPage.verifySearchedProducts(data.expected.searchedHeading);
    await productsPage.verifyProductAvailable(data.product);
    await productsPage.addProductToCart(data.product);
    await headerPage.verifyGuest();
    await headerPage.openCart();
    await cartPage.verifyProducts([data.product]);
    await cartPage.proceedToCheckout();
    await cartPage.verifyRegisterLoginRequired(data.expected.registerLogin);
    await cartPage.followRegisterLogin();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
  });

  test("TC175: Verify authenticated user sees Address Details and Review Your Order sections on checkout page", async () => {
    await allure.feature("Story 91 — Proceed to Checkout and Review Delivery, Billing and Order Details");
    await allure.story('ADO story 91');
    await allure.tms('175');
    const data = testData.tc175;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(credentials.email, credentials.password, data.profile);
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await loginPage.navigate();
    await loginPage.login(credentials.email, credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
    await productsPage.navigate();
    await productsPage.searchProducts(data.product);
    await productsPage.verifySearchedProducts(data.expected.searchedHeading);
    await productsPage.verifyProductAvailable(data.product);
    await productsPage.addProductToCart(data.product);
    await headerPage.openCart();
    await cartPage.verifyProducts([data.product]);
    await cartPage.proceedToCheckout();
    await checkoutPage.verifySections(data.expected.addressHeading, data.expected.orderHeading);
  });

  test("TC176: Validate delivery address matches registration address at checkout", async () => {
    await allure.feature("Story 91 — Proceed to Checkout and Review Delivery, Billing and Order Details");
    await allure.story('ADO story 91');
    await allure.tms('176');
    const data = testData.tc176;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(credentials.email, credentials.password, data.profile);
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await loginPage.navigate();
    await loginPage.login(credentials.email, credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
    await productsPage.navigate();
    await productsPage.searchProducts(data.product);
    await productsPage.verifySearchedProducts(data.expected.searchedHeading);
    await productsPage.verifyProductAvailable(data.product);
    await productsPage.addProductToCart(data.product);
    await headerPage.openCart();
    await cartPage.verifyProducts([data.product]);
    await cartPage.proceedToCheckout();
    await checkoutPage.verifySections(data.expected.addressHeading, data.expected.orderHeading);
    await checkoutPage.verifyDeliveryAddress(data.expected.address);
  });

  test("TC177: Validate billing address matches registration address at checkout", async () => {
    await allure.feature("Story 91 — Proceed to Checkout and Review Delivery, Billing and Order Details");
    await allure.story('ADO story 91');
    await allure.tms('177');
    const data = testData.tc177;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(credentials.email, credentials.password, data.profile);
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await loginPage.navigate();
    await loginPage.login(credentials.email, credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
    await productsPage.navigate();
    await productsPage.searchProducts(data.product);
    await productsPage.verifySearchedProducts(data.expected.searchedHeading);
    await productsPage.verifyProductAvailable(data.product);
    await productsPage.addProductToCart(data.product);
    await headerPage.openCart();
    await cartPage.verifyProducts([data.product]);
    await cartPage.proceedToCheckout();
    await checkoutPage.verifySections(data.expected.addressHeading, data.expected.orderHeading);
    await checkoutPage.verifyBillingAddress(data.expected.address);
  });

  test("TC178: Validate ability to enter order comment and select Place Order", async () => {
    await allure.feature("Story 91 — Proceed to Checkout and Review Delivery, Billing and Order Details");
    await allure.story('ADO story 91');
    await allure.tms('178');
    const data = testData.tc178;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(credentials.email, credentials.password, data.profile);
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await loginPage.navigate();
    await loginPage.login(credentials.email, credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
    await productsPage.navigate();
    await productsPage.searchProducts(data.product);
    await productsPage.verifySearchedProducts(data.expected.searchedHeading);
    await productsPage.verifyProductAvailable(data.product);
    await productsPage.addProductToCart(data.product);
    await headerPage.openCart();
    await cartPage.verifyProducts([data.product]);
    await cartPage.proceedToCheckout();
    await checkoutPage.verifySections(data.expected.addressHeading, data.expected.orderHeading);
    await checkoutPage.verifyOrderCommentAvailable();
    await checkoutPage.enterOrderComment(data.comment);
    await checkoutPage.verifyOrderComment(data.comment);
    await checkoutPage.verifyPlaceOrderAvailable();
    await checkoutPage.placeOrder();
    await paymentPage.verifyPaymentStep(data.expected.paymentHeading);
  });

  test("TC179: Verify cart contents are preserved when an unauthenticated user logs in via checkout path", async () => {
    await allure.feature("Story 91 — Proceed to Checkout and Review Delivery, Billing and Order Details");
    await allure.story('ADO story 91');
    await allure.tms('179');
    const data = testData.tc179;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(credentials.email, credentials.password, data.profile);
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await productsPage.navigate();
    await productsPage.searchProducts(data.product);
    await productsPage.verifySearchedProducts(data.expected.searchedHeading);
    await productsPage.verifyProductAvailable(data.product);
    await productsPage.addProductToCart(data.product);
    await headerPage.verifyGuest();
    await productsPage.addProductToCart(data.product);
    await headerPage.openCart();
    await cartPage.verifyProducts([data.product]);
    await cartPage.verifyProductQuantity(data.product, data.expected.quantity);
    await cartPage.proceedToCheckout();
    await cartPage.verifyRegisterLoginRequired(data.expected.registerLogin);
    await cartPage.followRegisterLogin();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await loginPage.login(credentials.email, credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
    await headerPage.openCart();
    await cartPage.verifyProducts([data.product]);
    await cartPage.verifyProductQuantity(data.product, data.expected.quantity);
  });

  test("TC180: Handle empty cart when attempting to proceed to checkout", async () => {
    await allure.feature("Story 91 — Proceed to Checkout and Review Delivery, Billing and Order Details");
    await allure.story('ADO story 91');
    await allure.tms('180');
    const data = testData.tc180;
    await cartPage.navigate();
    await cartPage.verifyCartEmpty(data.expected.emptyCart);
  });

  test.beforeAll(async () => {
    testData = JSON.parse(fs.readFileSync('./resources/testData/CheckoutTestJsonFile.json', 'utf8'));
  });

  test.beforeEach('Reset per-test account state', () => {
    attemptedCustomer = undefined;
    apisCustomers = undefined;
  });

  test.beforeEach('Block third-party advertising in the isolated page', async ({ page }) => {
    await blockThirdPartyAdvertising(page);
  });

  test.beforeEach('Initialize checkout services and page objects', async ({ page, request }) => {
    apisCustomers = new ApisCustomers(request);
    headerPage = new HeaderPage(page);
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    paymentPage = new PaymentPage(page);
  });

  test.afterEach('Clean up the case-owned customer and verify absence', async () => {
    await apisCustomers?.cleanupCustomerIfCreated(attemptedCustomer?.email, attemptedCustomer?.password);
  });
});
