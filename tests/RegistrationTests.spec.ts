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
import { DeletedAccountPage } from '../src/pages/DeletedAccountPage';
import { ProductsPage } from '../src/pages/ProductsPage';
import { CartPage } from '../src/pages/CartPage';
import { CheckoutPage } from '../src/pages/CheckoutPage';

let testData: typeof import('../resources/testData/RegistrationTestJsonFile.json');
let apisCustomers: ApisCustomers | undefined;
let attemptedCustomer: { email: string; password: string } | undefined;
let headerPage: HeaderPage;
let loginPage: LoginPage;
let registrationPage: RegistrationPage;
let createdAccountPage: CreatedAccountPage;
let deletedAccountPage: DeletedAccountPage;
let productsPage: ProductsPage;
let cartPage: CartPage;
let checkoutPage: CheckoutPage;
const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '') + '-' + randomUUID().slice(0, 8);

// Keep password inputs out of protocol traces; retain the existing failure media policy.
test.use({ trace: 'off' });

test.describe('Story 83 — Customer registration', () => {
  test('TC98: Create a new customer account from Signup / Login using an unregistered email', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('98');
    const data = testData.tc98;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.navigate();
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    attemptedCustomer = credentials;
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);
    await loginPage.navigate();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.startSignup(data.profile.name, credentials.email);
    await registrationPage.verifyAccountForm(data.expected.accountHeading);
    await registrationPage.completeDetails(data.profile, credentials.password);
    await registrationPage.verifyCompletedDetails(data.profile, credentials.password);
    await registrationPage.submitRegistration();
    await createdAccountPage.verifyCreated(data.expected.created);
  });

  test('TC99: Continue from account-created confirmation signs in the new customer', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('99');
    const data = testData.tc99;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    await loginPage.navigate();
    await loginPage.startSignup(data.profile.name, credentials.email);
    await registrationPage.completeDetails(data.profile, credentials.password);
    await registrationPage.submitRegistration();
    await createdAccountPage.verifyCreated(data.expected.created);
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);
    await createdAccountPage.continueToApplication();
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
  });

  test('TC100: Reject registration when the email address is already registered', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('100');
    const data = testData.tc100;
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
      data.registeredProfile,
    );
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    const present = await apisCustomers!.findCustomer(credentials.email);
    await loginPage.navigate();
    await apisCustomers!.verifyCustomerPresent(
      present,
      data.expected.httpStatus,
      data.expected.presentApi,
      data.registeredProfile.name,
    );
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);
    await loginPage.navigate();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.startSignup(data.profile.name, credentials.email);
    await loginPage.verifyDuplicateSignup(data.expected.duplicateError);
    await headerPage.verifyGuest();
  });

  test('TC101: Create account with newsletter and partner-offer preferences selected', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('101');
    const data = testData.tc101;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.navigate();
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    attemptedCustomer = credentials;
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);
    await loginPage.startSignup(data.profile.name, credentials.email);
    await registrationPage.verifyAccountForm(data.expected.accountHeading);
    await registrationPage.selectBothPreferences();
    await registrationPage.verifySelectedPreferences();
    await registrationPage.completeDetails(data.profile, credentials.password);
    await registrationPage.submitRegistration();
    await createdAccountPage.verifyCreated(data.expected.created);
  });

  test('TC102: Create account without selecting optional newsletter or partner-offer preferences', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('102');
    const data = testData.tc102;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.navigate();
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    attemptedCustomer = credentials;
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);
    await loginPage.startSignup(data.profile.name, credentials.email);
    await registrationPage.verifyAccountForm(data.expected.accountHeading);
    await registrationPage.verifyUncheckedPreferences();
    await registrationPage.completeDetails(data.profile, credentials.password);
    await registrationPage.submitRegistration();
    await createdAccountPage.verifyCreated(data.expected.created);
  });

  test('TC103: Account information form captures documented account and contact/address fields', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('103');
    const data = testData.tc103;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.navigate();
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);
    await loginPage.startSignup(data.profile.name, credentials.email);
    await registrationPage.verifyAccountForm(data.expected.accountHeading);
    await registrationPage.verifyAccountControls();
    await registrationPage.verifyAddressControls();
  });

  test('TC104: Prevent duplicate account creation after a successful registration', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('104');
    const data = testData.tc104;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.navigate();
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    attemptedCustomer = credentials;
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);
    await loginPage.startSignup(data.profile.name, credentials.email);
    await registrationPage.completeDetails(data.profile, credentials.password);
    await registrationPage.submitRegistration();
    await createdAccountPage.verifyCreated(data.expected.created);
    await createdAccountPage.continueToApplication();
    await headerPage.logout();
    await loginPage.navigate();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.startSignup(data.profile.name, credentials.email);
    await loginPage.verifyDuplicateSignup(data.expected.duplicateError);
    await headerPage.verifyGuest();
  });

  test('TC105: Registered customer can sign in with credentials created during registration', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('105');
    const data = testData.tc105;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.navigate();
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    attemptedCustomer = credentials;
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);
    await loginPage.startSignup(data.profile.name, credentials.email);
    await registrationPage.completeDetails(data.profile, credentials.password);
    await registrationPage.submitRegistration();
    await createdAccountPage.verifyCreated(data.expected.created);
    await createdAccountPage.continueToApplication();
    await headerPage.logout();
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.login(credentials.email, credentials.password);
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
  });

  test('TC106: Checkout delivery and billing addresses match registration address after account creation', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('106');
    const data = testData.tc106;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await productsPage.navigate();
    await productsPage.verifyProductAvailable(data.products[0]);
    await loginPage.navigate();
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    attemptedCustomer = credentials;
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);

    await loginPage.startSignup(data.profile.name, credentials.email);
    await registrationPage.completeDetails(data.profile, credentials.password);
    await registrationPage.submitRegistration();
    await createdAccountPage.verifyCreated(data.expected.created);
    await createdAccountPage.continueToApplication();
    await headerPage.verifyAuthenticated(data.expected.loggedIn);

    await productsPage.navigate();
    await productsPage.addProductToCart(data.products[0]);
    await headerPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.verifySections(data.expected.addressHeading, data.expected.orderHeading);
    await checkoutPage.verifyDeliveryAddress(data.expected.deliveryAddress);
    await checkoutPage.verifyBillingAddress(data.expected.billingAddress);
  });

  test('TC107: Unauthenticated checkout provides Register / Login path before completing checkout', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('107');
    const data = testData.tc107;

    await productsPage.navigate();
    await productsPage.addProductToCart(data.products[0]);
    await headerPage.openCart();
    await headerPage.verifyGuest();
    await cartPage.verifyProducts(data.products);

    await headerPage.openCart();
    await cartPage.verifyProducts(data.products);
    await cartPage.proceedToCheckout();
    await cartPage.verifyRegisterLoginRequired(data.expected.registerLogin);
  });

  test('TC108: Registration-created authenticated session displays checkout sections for authenticated customer', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('108');
    const data = testData.tc108;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await productsPage.navigate();
    await productsPage.verifyProductAvailable(data.products[0]);
    await loginPage.navigate();
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    attemptedCustomer = credentials;
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);

    await loginPage.startSignup(data.profile.name, credentials.email);
    await registrationPage.completeDetails(data.profile, credentials.password);
    await registrationPage.submitRegistration();
    await createdAccountPage.verifyCreated(data.expected.created);
    await createdAccountPage.continueToApplication();
    await headerPage.verifyAuthenticated(data.expected.loggedIn);

    await productsPage.navigate();
    await productsPage.addProductToCart(data.products[0]);
    await headerPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.verifySections(data.expected.addressHeading, data.expected.orderHeading);
  });

  test('TC109: Header identity remains consistent between registration continuation and later sign-in', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('109');
    const data = testData.tc109;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.navigate();
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    attemptedCustomer = credentials;
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);

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

  test('TC110: Registered customer can delete the newly created account after registration', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('110');
    const data = testData.tc110;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.navigate();
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    attemptedCustomer = credentials;
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);

    await loginPage.startSignup(data.profile.name, credentials.email);
    await registrationPage.completeDetails(data.profile, credentials.password);
    await registrationPage.submitRegistration();
    await createdAccountPage.verifyCreated(data.expected.created);
    await createdAccountPage.continueToApplication();
    await headerPage.verifyAuthenticated(data.expected.loggedIn);

    await headerPage.verifyDeletionAvailable();
    await headerPage.deleteAccount();
    await deletedAccountPage.verifyDeleted(data.expected.deleted);

    const removed = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(removed, data.expected.httpStatus, data.expected.absentApi);

    await deletedAccountPage.continueToApplication();
    await deletedAccountPage.verifyConfirmationLeft();
  });

  test('TC111: Duplicate registration attempt does not authenticate the customer', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('111');
    const data = testData.tc111;
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
      data.registeredProfile,
    );
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    const present = await apisCustomers!.findCustomer(credentials.email);
    await loginPage.navigate();
    await apisCustomers!.verifyCustomerPresent(
      present,
      data.expected.httpStatus,
      data.expected.presentApi,
      data.registeredProfile.name,
    );
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);
    await loginPage.startSignup(data.profile.name, credentials.email);
    await loginPage.verifyDuplicateSignup(data.expected.duplicateError);
    await headerPage.verifyGuest();
  });

  test('TC112: Registration flow remains usable with keyboard navigation', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('112');
    const data = testData.tc112;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.navigate();
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    attemptedCustomer = credentials;
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);
    const signupFocus = await loginPage.inspectSignupKeyboardOrder();
    await loginPage.verifyKeyboardOrder(signupFocus, data.keyboardOrder);
    await loginPage.startSignupWithKeyboard(data.profile.name, credentials.email);
    await registrationPage.verifyAccountForm(data.expected.accountHeading);
    const registrationFocus = await registrationPage.completeDetailsWithKeyboard(
      data.profile,
      credentials.password,
    );
    await registrationPage.verifyKeyboardDetails(
      registrationFocus,
      data.registrationKeyboardOrder,
      data.profile,
      credentials.password,
    );
    await registrationPage.verifySelectedPreferences();
    await registrationPage.submitRegistrationWithKeyboard();
    await createdAccountPage.verifyCreated(data.expected.created);
  });

  test('TC113: Registration duplicate-email feedback is visible and specific', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('113');
    const data = testData.tc113;
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
      data.registeredProfile,
    );
    await apisCustomers!.verifyCustomerRegistered(registered, data.expected.createApi);
    const present = await apisCustomers!.findCustomer(credentials.email);
    await loginPage.navigate();
    await apisCustomers!.verifyCustomerPresent(
      present,
      data.expected.httpStatus,
      data.expected.presentApi,
      data.registeredProfile.name,
    );
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);
    await loginPage.startSignup(data.profile.name, credentials.email);
    await loginPage.verifyDuplicateFeedbackVisible();
    await loginPage.verifyDuplicateSignup(data.expected.duplicateError);
  });

  test('TC114: Registration flow is usable on a small-screen layout', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('114');
    const data = testData.tc114;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    await loginPage.useSmallViewport(data.viewport);
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.navigate();
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    await loginPage.verifyLoginPage(data.expected.loginHeading, data.expected.signupHeading);
    await headerPage.verifyGuest();
    attemptedCustomer = credentials;
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);
    await loginPage.startSignup(data.profile.name, credentials.email);
    await registrationPage.reachMobileAccountForm();
    await registrationPage.verifyMobileAccountForm(data.expected.accountHeading, data.viewport);
    await registrationPage.completeDetails(data.profile, credentials.password);
    await registrationPage.selectBothPreferences();
    await registrationPage.reachMobileRegistrationControls();
    await registrationPage.verifyCompletedDetails(data.profile, credentials.password);
    await registrationPage.verifySelectedPreferences();
    await registrationPage.verifyMobileRegistrationControls(data.viewport);

    await registrationPage.submitRegistration();
    await createdAccountPage.reachMobileConfirmation();
    await createdAccountPage.verifyMobileConfirmation(data.expected.created);
    await createdAccountPage.continueToApplication();
    await headerPage.verifyAuthenticated(data.expected.loggedIn);
  });

  test('TC115: Account-created confirmation and signed-in header remain visible on small-screen layout', async () => {
    await allure.feature('Story 83 — Customer registration');
    await allure.story('ADO story 83');
    await allure.tms('115');
    const data = testData.tc115;
    const credentials = {
      email: `${data.emailBase}-${timestamp}@${data.emailDomain}`,
      password: data.password,
    };
    await loginPage.useSmallViewport(data.viewport);
    const absent = await apisCustomers!.findCustomer(credentials.email);
    await apisCustomers!.verifyCustomerAbsent(absent, data.expected.httpStatus, data.expected.absentApi);
    attemptedCustomer = credentials;
    await loginPage.navigate();
    await loginPage.startSignup(data.profile.name, credentials.email);
    await registrationPage.completeDetails(data.profile, credentials.password);
    await registrationPage.submitRegistration();
    await createdAccountPage.verifyCreated(data.expected.created);
    await loginPage.verifyCredentialsReady(credentials.email, credentials.password);
    await registrationPage.verifyProfileReady(data.profile);
    await createdAccountPage.verifyMobileConfirmation(data.expected.created);
    await createdAccountPage.continueToApplication();
    await headerPage.verifyAuthenticated(data.expected.loggedIn);

    await headerPage.verifyMobileHeader(data.expected.loggedIn);
  });

  test.beforeAll(async () => {
    testData = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../resources/testData/RegistrationTestJsonFile.json'), 'utf8'),
    );
  });

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
    deletedAccountPage = new DeletedAccountPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
  });

  test.afterEach('Clean up the customer created by this test', async () => {
    await apisCustomers?.cleanupCustomerIfCreated(attemptedCustomer?.email, attemptedCustomer?.password);
  });
});
