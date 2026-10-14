# resources/apisCollections/ — the team API-collection knowledge library

The Postman collection exports (v2.1) in this folder are the QA team's curated API
knowledge for the backends of the application under test: the endpoints that matter,
their methods, payload shapes, auth flow, and the variable-chaining recipes that string
them into working journeys (e.g. authenticate → create a record → confirm it). They are
the API counterpart of `resources/Queries/` — durable application knowledge the harness
consults instead of rediscovering. Governed by the 2026-08-26 "Team API-collection
library & configuration sources" ruling (design-conventions, Decision records).

## Ownership & lifecycle — curated on import (differs from `resources/Queries/`)

- **The source of truth is the team's Postman workspace.** Endpoint corrections happen
  there and arrive by re-export.
- **The checked-in copy is harness-curated** — unlike the Queries library, a raw
  Postman export is NOT committed verbatim, because exports capture point-in-time
  session state (live bearer tokens, session cookies, vault variable references,
  browser download suffixes in the filename). Every import/re-export goes through the
  **import ritual** below before it lands; request/response semantics (method, path,
  payload shape, scripts) are never altered by it.
- Reference a request by its `name` inside the collection, never by array position.

### Import ritual (each export / re-export)

1. **Normalize the filename** to `<collection-slug>.postman_collection.json`
   (e.g. `acme-qc.postman_collection.json`) — no spaces, no download counters.
2. **Strip point-in-time secrets**: hardcoded `Authorization: Bearer <jwt>` header
   values become `Bearer {{token}}` (the collection's own Token request chains it);
   `Cookie` session headers are deleted; Postman-vault variable artifacts
   (`*_api_key_*`-style names) are removed from headers and the
   `variable` block. A secret never survives into git, not even an expired one.
3. **Parametrize hosts** as collection variables (`{{baseUrl}}`, `{{tokenBaseUrl}}`,
   `{{internalBaseUrl}}`, …) with the export's literal hosts preserved as the variable
   values — environment coordinates stay visible but swap in one place.
4. **Drop empty junk requests** (unnamed/blank-URL placeholder entries).
5. **Keep everything else verbatim** — bodies, pre-request/test scripts, descriptions
   (including "Generated from cURL" provenance notes), sample values, and item order.
6. **Update the index below** and note anything odd for the team to confirm.

## How the harness consumes the library — derive-only

The library is **read, understood, and derived from — never replayed as-is**.
Consumption paths:

| Consumer | When | What it derives |
|---|---|---|
| automate-suite REFINE / prerequisite dictionary `api` routes | converting seed/verification intents to `api:` steps | proposed `integration/*_api.json` catalog entries (user-confirmed before EXPLORE) |
| automate-suite GENERATE / service-classes | authoring `Apis<Domain>` classes | `readonly <operation>_serviceName` fields, request payload shapes (typed parameter objects), auth flow |
| test-data reusability ladder (step 2) | a rerun fails on consumed/stale data | the API seed/cleanup route that makes the case re-runnable |
| Manual execution / native API runtime | frozen operation definitions | derive collection requests into parameterized defineApiOperation definitions; source samples are never replayed |

## Adaptation rules (collection request → framework/catalog artifact)

1. **Endpoint paths become `<operation>_serviceName` fields** on the owning
   `Apis<Domain>` class (service-classes practice 3) — never inline literals. Writing
   an endpoint the collection already knows, from scratch, is a review finding
   (`collection-library-bypassed`).
2. **Base URLs are environment data, not endpoint data.** The `{{baseUrl}}`-style
   variables map to `playwright.config.ts` / config files for the POM layer and to
   the configured target baseUrl for native execution — never
   hardcoded in a class or spec. Note: an export may point its Token request at a
   **different host** than the business requests (e.g. a dev token host alongside qc
   business hosts) — preserve the distinction as separate variables
   (`{{tokenBaseUrl}}` vs `{{baseUrl}}`) and confirm with the team before relying
   on it.
3. **Sample literals never leave the library.** Customer/member ids, IBANs, phone
   numbers, emails, and record GUIDs in request bodies are
   point-in-time examples — never test data, never expected values, never defaults
   (leak = review finding `collection-sample-literal-leaked`). Payload values arrive
   as parameters from `resources/testData/*.json`.
4. **Pre-request/test scripts are recipes, not code to port blindly.** They document
   the data-generation rules (e.g. a reference number = N random digits; an id field
   with a fixed leading digit) and the response-to-request chaining (`token`,
   reference numbers, and names flow between requests). Derive the
   equivalent TypeScript in the framework's test-data/utils layers; never execute the
   JavaScript itself.
5. **Auth is the chained `{{token}}`** from the Token request — in the framework this
   is an `Apis<Domain>` action whose response feeds subsequent calls; in native execution
   it is the target credentialRef and protected input indirection. Literal tokens never appear
   anywhere.
6. **Internal-host requests** (ops/back-office endpoints on internal IPs) are ops
   levers, not customer-facing endpoints — treat them as seed/fixture material with
   the same care the automate-suite triage applies to anything hard-to-reverse.

## Index

### Automation Exercise

Source: [published API documentation](https://www.automationexercise.com/api_list),
consulted on 2026-10-04. The collection below is derived from that documentation,
not an exported workspace. It preserves the 14 documented scenarios in source order.

The `qa` API target is `app`, with base URL
`https://www.automationexercise.com/api`. Runtime paths are relative to that base
(for example, `/productsList`, not `/api/productsList`). No bearer credential is
configured. Account requests take their email/password inputs from the selected case
or protected local credential references; they do not use the ADO PAT.

All collection inputs are empty placeholders. Supply scenario-owned inputs, keep
credential values in protected references, and declare cleanup for temporary accounts.
Select requests by name and derive operations; do not run the collection as a suite.

#### Response and encoding observations

A read-only connectivity check on 2026-10-04 confirmed that both the documented
non-www host and the configured www host return the product list without redirects.
The configured host returned HTTP 200, JSON `responseCode: 200`, and a products array.
Its content type was `text/html`, so parse the body as JSON rather than relying on
the content-type header alone. Product samples were not saved as test data.

A search check with an application/x-www-form-urlencoded body returned HTTP 200
and JSON `responseCode: 200`; sending the same parameter as JSON returned HTTP 200
and JSON `responseCode: 400`. The documentation's response codes are recorded as
body-code expectations in the collection descriptions, not as asserted HTTP statuses.
Check both the transport status and the case's expected JSON fields during execution.

#### Harness 3.2.0 support (historical)

The native API runtime supports query parameters and JSON bodies, but cannot encode
form bodies. GET requests and parameterless negative-method requests can be derived
for `/execute-test`. Parameterized search, login, and account create/update/delete
requests require form-body support before they can be used as native execution steps.
Do not substitute a JSON body or silently change the case to get around that limit.
Generated POM service methods can use the existing `ApiActions` facade with Playwright's
`form` option when durable automation is requested. An API target configuration and
a collection import alone do not add native form support.

#### Harness 3.6.0 support (updated 2026-10-14)

The installed 3.6.0 native API runtime now supports URL-encoded form bodies in
standalone, sequential and manual execution. Derive parameterized search, login
and account operations from this collection using `request.form` instead of
`request.json`, with the `qa` target `app`. The body must be a flat object of
strings, finite numbers, booleans or typed input bindings; JSON and form bodies
are mutually exclusive. Bind sensitive fields through protected inputs, supply
case-owned values rather than collection placeholders, and retain the case's
transport/body checks and required account cleanup. The existing POM facade's
Playwright `form` calls need no migration. See the installed
[API guide](../../node_modules/playwright-pom-harness/docs/reference/api.md#url-encoded-form-bodies).

| Collection | Request | Method & path | Notes |
|---|---|---|---|
| Automation Exercise | 01 - List catalog products | GET `/productsList` | Body code 200; product array |
| Automation Exercise | 02 - Reject POST on product catalog | POST `/productsList` | Body code 405 |
| Automation Exercise | 03 - List catalog brands | GET `/brandsList` | Body code 200; brand array |
| Automation Exercise | 04 - Reject PUT on brand catalog | PUT `/brandsList` | Body code 405 |
| Automation Exercise | 05 - Search catalog by term | POST `/searchProduct` | Form: search_product; body code 200 |
| Automation Exercise | 06 - Search with an omitted term | POST `/searchProduct` | No search_product; body code 400 |
| Automation Exercise | 07 - Check accepted account credentials | POST `/verifyLogin` | Form: email, password; body code 200 |
| Automation Exercise | 08 - Check credentials with email omitted | POST `/verifyLogin` | Form: password; body code 400 |
| Automation Exercise | 09 - Reject DELETE on credential check | DELETE `/verifyLogin` | Body code 405 |
| Automation Exercise | 10 - Check rejected account credentials | POST `/verifyLogin` | Form: invalid_email, invalid_password values sent as email/password; body code 404 |
| Automation Exercise | 11 - Register a test account | POST `/createAccount` | Form: documented profile fields; body code 201 |
| Automation Exercise | 12 - Remove a test account | DELETE `/deleteAccount` | Form: email, password; body code 200 |
| Automation Exercise | 13 - Revise a test account profile | PUT `/updateAccount` | Form: documented profile fields; body code 200 |
| Automation Exercise | 14 - Look up an account by email | GET `/getUserDetailByEmail` | Query: email; body code 200 |

### Sanitization ledger

Append one dated subsection per import/re-export
(`### <collection-slug>.postman_collection.json (imported <date>)`) recording exactly
what the import ritual changed — filename normalization, dropped junk requests,
renamed requests, stripped secrets/cookies/vault artifacts, host parametrization —
so the diff against the team's next export stays explainable. Bodies, scripts,
descriptions, and item order are never touched, and each entry says so.

### automation-exercise.postman_collection.json (imported 2026-10-04)

- Created a Postman v2.1 reference collection from the public documentation; no
  original collection export was supplied or overwritten.
- Used a normalized filename and a `baseUrl` variable mapped to the configured
  www host. A read-only product-list check verified that host without redirects.
- Kept documented methods, endpoint paths, parameter names, and scenario order;
  request names are stable paraphrases with source scenario numbers.
- Used empty variable placeholders for all scenario inputs, including credentials;
  there were no source tokens, cookies, vault references, or scripts to import.
- Descriptions record documented body codes and the source link. No response samples,
  test scripts, or live account data were added. Form encoding was confirmed through
  read-only search checks; native runtime limitations are recorded above.
