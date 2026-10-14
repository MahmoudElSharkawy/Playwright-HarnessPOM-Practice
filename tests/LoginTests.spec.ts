import { test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import * as allure from 'allure-js-commons';
import { ApisCustomers } from '../src/apis/ApisCustomers';
import { HeaderPage } from '../src/pages/HeaderPage';
import { LoginPage } from '../src/pages/LoginPage';
import { RegistrationPage } from '../src/pages/RegistrationPage';
import { CreatedAccountPage } from '../src/pages/CreatedAccountPage';
import { ProductsPage } from '../src/pages/ProductsPage';
import { CartPage } from '../src/pages/CartPage';
import { CheckoutPage } from '../src/pages/CheckoutPage';

let testData: typeof import('../resources/testData/LoginTestJsonFile.json');
let apisCustomers: ApisCustomers | undefined;
let attemptedCustomer: { email: string; password: string } | undefined;
let headerPage: HeaderPage;
let loginPage: LoginPage;
let registrationPage: RegistrationPage;
let createdAccountPage: CreatedAccountPage;
let productsPage: ProductsPage;
let cartPage: CartPage;
let checkoutPage: CheckoutPage;
const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '') + '-' + randomUUID().slice(0, 8);

// Keep password inputs out of protocol traces; retain the existing failure media policy.
test.use({ trace: 'off' });

test.describe('Story 84 — Customer sign in and sign out', () => {
  test('TC116: Authenticate registered customer with correct email and password', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('116');
    const data = testData.tc116;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(
      credentials.email,
      credentials.password,
      data.profile,
    );
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await loginPage.navigate();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await loginPage.enterCredentials(credentials.email, credentials.password);
    await loginPage.verifyEnteredCredentials(credentials.email, credentials.password);
    await loginPage.submitLogin();
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
  });

  test('TC117: Reject incorrect email and password combination', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('117');
    const data = testData.tc117;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    await loginPage.navigate();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await loginPage.enterCredentials(credentials.email, credentials.password);
    await loginPage.verifyEnteredCredentials(credentials.email, credentials.password);
    await loginPage.submitLogin();
    await loginPage.verifyRejectedLogin(data.expected.loginError);
    await headerPage.verifyGuest();
  });

  test('TC118: Logout ends authenticated session and returns Customer to login page', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('118');
    const data = testData.tc118;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(
      credentials.email,
      credentials.password,
      data.profile,
    );
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await loginPage.navigate();
    await loginPage.login(credentials.email, credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await headerPage.logout();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
  });

  test('TC119: Login displays the registered customer name in the authenticated header', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('119');
    const data = testData.tc119;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(
      credentials.email,
      credentials.password,
      data.profile,
    );
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await loginPage.navigate();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await loginPage.enterCredentials(credentials.email, credentials.password);
    await loginPage.verifyEnteredCredentials(credentials.email, credentials.password);
    await loginPage.submitLogin();
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
  });

  test('TC120: Do not authenticate when registered email is submitted with incorrect password', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('120');
    const data = testData.tc120;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const seedCredentials = { email: credentials.email, password: data.seedPassword };
    const absent = await apisCustomers!.findCustomer(seedCredentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = seedCredentials;
    const registered = await apisCustomers!.registerCustomer(
      seedCredentials.email,
      seedCredentials.password,
      data.profile,
    );
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await loginPage.navigate();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await loginPage.enterCredentials(credentials.email, credentials.password);
    await loginPage.verifyEnteredCredentials(credentials.email, credentials.password);
    await loginPage.submitLogin();
    await loginPage.verifyRejectedLogin(data.expected.loginError);
    await headerPage.verifyGuest();
  });

  test('TC121: Do not authenticate when unregistered email is submitted with a password', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('121');
    const data = testData.tc121;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.navigate();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await loginPage.enterCredentials(credentials.email, credentials.password);
    await loginPage.verifyEnteredCredentials(credentials.email, credentials.password);
    await loginPage.submitLogin();
    await loginPage.verifyRejectedLogin(data.expected.loginError);
    await headerPage.verifyGuest();
  });

  test('TC122: Show incorrect credentials message consistently after repeated failed login attempt', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('122');
    const data = testData.tc122;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    await loginPage.navigate();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await loginPage.login(credentials.email, credentials.password);
    await loginPage.verifyRejectedLogin(data.expected.loginError);
    await headerPage.verifyGuest();
    await loginPage.login(credentials.email, credentials.password);
    await loginPage.verifyRejectedLogin(data.expected.loginError);
    await headerPage.verifyGuest();
  });

  test('TC123: Login after account registration supports the same authenticated header behavior', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('123');
    const data = testData.tc123;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    await loginPage.navigate();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);

    await loginPage.startSignup(data.profile.name, credentials.email);
    await registrationPage.completeDetails(data.profile, credentials.password);
    await registrationPage.submitRegistration();
    await createdAccountPage.verifyCreated(data.expected.created);
    await createdAccountPage.continueToApplication();
    await headerPage.verifyAuthenticated(data.expected.loggedIn);

    await headerPage.logout();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.login(credentials.email, credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
  });

  test('TC124: Preserve pre-login cart products when Customer signs in', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('124');
    const data = testData.tc124;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(
      credentials.email,
      credentials.password,
      data.profile,
    );
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await productsPage.navigate();
    await productsPage.searchProducts(data.searchTerm);
    await productsPage.addProductToCart(data.products[0]);
    await productsPage.addProductToCart(data.products[1]);
    await headerPage.openCart();
    await headerPage.verifyGuest();
    await cartPage.verifyProducts(data.products);
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await headerPage.openLogin();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.login(credentials.email, credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
    await headerPage.openCart();
    await cartPage.verifyProducts(data.products);
  });

  test('TC125: Authenticate from checkout register-login path and display checkout sections', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('125');
    const data = testData.tc125;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(
      credentials.email,
      credentials.password,
      data.profile,
    );
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await productsPage.navigate();
    await productsPage.addProductToCart(data.products[0]);
    await productsPage.addProductToCart(data.products[1]);
    await headerPage.openCart();
    await headerPage.verifyGuest();
    await cartPage.verifyProducts(data.products);
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await cartPage.proceedToCheckout();
    await cartPage.verifyRegisterLoginRequired(data.expected.registerLogin);
    await cartPage.followRegisterLogin();
    await loginPage.login(credentials.email, credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
    await headerPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.verifySections(data.expected.addressHeading, data.expected.orderHeading);
  });

  test('TC126: Logout prevents authenticated checkout access until Customer signs in again', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('126');
    const data = testData.tc126;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(
      credentials.email,
      credentials.password,
      data.profile,
    );
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await loginPage.navigate();
    await loginPage.login(credentials.email, credentials.password);
    await productsPage.navigate();
    await productsPage.addProductToCart(data.products[0]);
    await productsPage.addProductToCart(data.products[1]);
    await headerPage.openCart();
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
    await cartPage.verifyProducts(data.products);
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await headerPage.logout();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await headerPage.openCart();

    await cartPage.verifyCheckoutAvailable();
    await cartPage.proceedToCheckout();
    await cartPage.verifyRegisterLoginRequired(data.expected.registerLogin);
  });

  test('TC127: Invalid login does not allow checkout as authenticated Customer', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('127');
    const data = testData.tc127;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    await productsPage.navigate();
    await productsPage.addProductToCart(data.products[0]);
    await productsPage.addProductToCart(data.products[1]);
    await headerPage.openCart();
    await cartPage.verifyProducts(data.products);
    await headerPage.openLogin();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await loginPage.login(credentials.email, credentials.password);
    await loginPage.verifyRejectedLogin(data.expected.loginError);
    await headerPage.verifyGuest();
    await headerPage.openCart();
    await cartPage.proceedToCheckout();
    await cartPage.verifyRegisterLoginRequired(data.expected.registerLogin);
  });

  test('TC128: Login form supports correction after failed authentication', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('128');
    const data = testData.tc128;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(
      credentials.email,
      credentials.password,
      data.profile,
    );
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    const incorrectCredentials = { email: credentials.email, password: data.wrongPassword };
    await loginPage.navigate();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(
      credentials.email,
      credentials.password,
      incorrectCredentials.password,
    );
    await loginPage.login(incorrectCredentials.email, incorrectCredentials.password);
    await loginPage.verifyRejectedLogin(data.expected.loginError);
    await headerPage.verifyGuest();
    await loginPage.correctPassword(credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
  });

  test('TC129: Logout and sign in again with the same registered account', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('129');
    const data = testData.tc129;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(
      credentials.email,
      credentials.password,
      data.profile,
    );
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await loginPage.navigate();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await loginPage.login(credentials.email, credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
    await headerPage.logout();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.login(credentials.email, credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
  });

  test('TC130: Keyboard user can complete login and logout flow', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('130');
    const data = testData.tc130;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(
      credentials.email,
      credentials.password,
      data.profile,
    );
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await loginPage.navigate();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    const focusOrder = await loginPage.inspectLoginKeyboardOrder();
    await loginPage.verifyKeyboardOrder(focusOrder, data.keyboardOrder);
    await loginPage.loginWithKeyboard(credentials.email, credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
    await headerPage.logoutWithKeyboard();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
  });

  test('TC131: Keyboard user receives incorrect credentials feedback without authentication', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('131');
    const data = testData.tc131;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    await loginPage.navigate();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    const focusOrder = await loginPage.inspectLoginKeyboardOrder();
    await loginPage.verifyKeyboardOrder(focusOrder, data.keyboardOrder);
    await loginPage.loginWithKeyboard(credentials.email, credentials.password);
    await loginPage.verifyRejectedLogin(data.expected.loginError);
    await headerPage.verifyGuest();
  });

  test('TC132: Login page remains usable on a small viewport', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('132');
    const data = testData.tc132;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(
      credentials.email,
      credentials.password,
      data.profile,
    );
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await loginPage.useSmallViewport(data.viewport);
    await loginPage.navigate();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await loginPage.reachMobileLoginControls();
    await loginPage.verifyMobileLoginControls();
    await loginPage.login(credentials.email, credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
  });

  test('TC133: Authenticated header and Logout action remain reachable on a small viewport', async () => {
    await allure.feature('Story 84 — Customer sign in and sign out');
    await allure.story('ADO story 84');
    await allure.tms('133');
    const data = testData.tc133;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    const registered = await apisCustomers!.registerCustomer(
      credentials.email,
      credentials.password,
      data.profile,
    );
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    await loginPage.useSmallViewport(data.viewport);
    await loginPage.navigate();
    await loginPage.login(credentials.email, credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await headerPage.reachMobileHeader();
    await headerPage.verifyMobileHeader(data.expected.loggedIn);
    await headerPage.logout();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
  });

  test.beforeAll(async () => {
    testData = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../resources/testData/LoginTestJsonFile.json'), 'utf8'),
    );
  });

  // M13 explicitly supports the native per-test page fixture: every case has a fresh context.
  test.beforeEach('Reset per-test state', () => {
    attemptedCustomer = undefined;
    apisCustomers = undefined;
  });

  test.beforeEach('Initialize services and page objects', async ({ page, request }) => {
    apisCustomers = new ApisCustomers(request);
    headerPage = new HeaderPage(page);
    loginPage = new LoginPage(page);
    registrationPage = new RegistrationPage(page);
    createdAccountPage = new CreatedAccountPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
  });

  test.afterEach('Clean up the customer created by this test', async () => {
    await apisCustomers?.cleanupCustomerIfCreated(attemptedCustomer?.email, attemptedCustomer?.password);
  });
});
