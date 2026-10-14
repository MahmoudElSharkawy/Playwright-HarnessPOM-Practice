# Story 87 — Search the Product Catalog

The complete, unchanged ADO source is retained in
[`ado-story-87.json`](../.harness/sources/ado-story-87.json). No product names,
actions, or expected results were substituted. The user authorized a **draft PR
with failures and blockers documented** on 2026-10-14.

## Implemented scope

`ProductSearchTests.spec.ts` implements TC134, TC135, TC144, TC146, and TC152.
Their separate source in `ado-story-87-supported.json` contains the same case
text and ADO identities. All 18 expectations were observed through the harness
browser runtime, with stable PASS assessments and completed browser cleanup.
This is a five-case scope, not full-story readiness.

The tests use isolated Playwright pages, `ProductsPage`, paired per-case JSON,
and ordinary assertions. Empty search compares every initial product-detail destination
with the resulting catalog and verifies that all restored links are visible and enabled,
without freezing a product count or order. Mobile checks
cover adjacency/alignment, unclipped cards/text/actions, visible/enabled/pointer-enabled
result controls, unobstructed reachable targets, vertical scrolling and horizontal
overflow. Page-owned actions reach the result cards and clear hover before pointer
checks; validation does not scroll or add products to the cart. Placeholder checks cover both native placeholder visibility
and its disappearance after typing.

The generation handoff and authoritative review/verification receipts are under
`.harness/state/generation/ado-story-87-supported/`. Delivery requires independent
framework review and two fresh scoped green processes for these five cases.
The PR records the actual verification results. These greens do not include the
fifteen cases below.

The first native verification passed four cases and failed TC146 because product-name
`textContent` included changing advertising descendants. The repair compares the
complete product-detail destination set and checks all restored links are visible
and enabled. The original failure remains in generation history; source expectations
and the fifteen full-story blockers were not changed.

## Failures and blockers retained

The 2026-10-14 QA catalog contains 34 clothing products. Its published collection
provides catalog reads/search and account operations, with no product-provisioning
operation for the missing fixtures. URL-encoded `POST /searchProduct` requests
returned HTTP 200 and JSON body code 200 for the case terms; missing-product
searches returned empty arrays. UI exploration independently checked the results.

| Case | Preserved expectation and observed blocker |
|---|---|
| TC136 | Dress must occur in every displayed name or description. Two displayed names lack Dress and the result cards expose no descriptions; API category metadata says Dress. Name/description versus category relevance needs a source ruling. |
| TC137 | Running Shoes must appear, be added from results, and have its correct cart quantity/price. Shoes search is empty; subsequent cart steps are blocked. |
| TC138 | Selecting Women must filter products, then Shoes must search globally and show both named running-shoe products. Women expands subcategory links instead of filtering; the shoe fixtures are absent. No child category was silently substituted. |
| TC139 | An unmatched term must display No products found or a similar message. The heading appears above an empty list with no such message. |
| TC140 | The exact special-character product T-Shirt w/ Logo & Size XL (2024) must appear. The term is accepted, but results are empty. |
| TC141 | Red T-Shirt and Blue T-Shirt must agree between UI and the intercepted API response. Both fixtures are absent. The UI uses page navigation; an independent form API call was not substituted for the required browser interception. |
| TC142 | Book results must support a next page or additional infinite-scroll results. Book search is empty, so the specified journey cannot run. |
| TC143 | Partial Jacket search must list matching products. Jacket search is empty. A zero-result comparison cannot establish successful partial matching. |
| TC145 | Padded Keyboard search must find Keyboard and establish trimming. Keyboard is absent; matching empty arrays would be a vacuous trimming check. |
| TC147 | Vintage Watch must open details and reach the cart with quantity 3 and the correct total. Watch search is empty; the details/cart journey and price oracle are unavailable. |
| TC148 | Gaming Mouse details and browser-back must preserve the term. Gaming Mouse is absent, blocking the specified navigation journey. |
| TC149 | The long term must remain responsive and promptly show a matching product or an empty-results message. It is accepted and the page responds, but the result is empty without the required message. A numeric performance SLA is also unspecified. |
| TC150 | Keyboard search must return Monitor with a clear focus indicator. Monitor is absent. Keyboard mechanics and visual focus are recorded separately; no visual-focus PASS is inferred from a focus attribute. |
| TC151 | Hemd or its cross-referenced English equivalent must appear. The exact localized search returns no products. |
| TC153 | A second search must be submitted before the first completes, with final Phone results. The current form performs page navigation; the sequential manual host cannot establish that overlap. Laptop/Phone fixtures are absent. No sequential run is labeled concurrent. |

These cases need fixture provisioning, an application change, a supported execution
mechanism, or an accepted source correction before their exact journeys can be
generated and receive full-story verification. None is marked automated or done.

## Execution reports and storage

The fresh execution of story 83 assessed 17 PASS and TC112 NEEDS_REVIEW. Story 84
assessed 15 PASS, TC126 FAIL, and TC130/TC131 NEEDS_REVIEW when the corrected TC133
rerun is included. TC126 independently reproduces an empty cart after logout,
preventing the expected Register / Login checkout path. Protected keyboard-only
password entry is the review limit for TC112, TC130 and TC131.

The primary story 84 report retains TC133's invalidated literal comparison as
NEEDS_REVIEW (14 PASS, 1 FAIL, 3 NEEDS_REVIEW); its separate corrected execution
assesses TC133 PASS. Timeout, overload and failed-cleanup history is retained.
All case-owned accounts, including recovery/rerun accounts, were independently
verified absent by API. No ADO bug, result or automation-status write was made.

| Scope | Execution ID |
|---|---|
| Story 83 | `execute-e83ef72b-97e1-437a-a818-580f1879bb05` |
| Story 84 | `execute-273144c0-c03f-4fa8-95bf-477d49f23e06` |
| Corrected TC133 | `execute-62adfa13-4721-4359-921d-e9a76e9bcaa8` |
| Story 87 exploration | `execute-e55281ed-29c1-43a2-90af-6abe563ff49b` |

Case Markdown and `_suite.json` live under the ignored
`execution-tests/ado-story-<id>/` folders. Fresh frozen inputs, registered evidence
and execution history live under `.harness/runs/`; rendered HTML reports live under
`reports/harness/`. Contextual ad/font/network diagnostics are not application bugs.
The committed neutral JSON retains all twenty original story 87 cases.
