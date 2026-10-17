<!-- Runbook skeleton — copy to README.md at the repo root and fill the placeholders (ships with the harness package). -->

# Playwright Harness POM Practice

Playwright/TypeScript POM test automation for **Automation Exercise**
(https://www.automationexercise.com), using harness 3.7.0. This README is the runbook: setup, how to run,
the env flags the framework consumes, and where every report lands.

## Setup

```bash
git clone https://github.com/MahmoudElSharkawy/Playwright-HarnessPOM-Practice.git
cd Playwright-HarnessPOM-Practice
npm ci                                # always via the lockfile — never per-package installs
npx playwright install --with-deps    # browsers (first time / CI)
```

Use Node 24. Destinations — application URLs, database servers — live in
`.harness/targets.json` (read by `src/config/targets.ts`). Copy `.env.example` to `.env`
(gitignored) and fill in the secrets — credentials and DB passwords come **only** from
environment variables, loaded by dotenv in `playwright.config.ts`. Never commit a
literal credential.

## Running tests

```bash
npx playwright test                                          # full run
npx playwright test tests/LoginTests.spec.ts                 # single spec
npx playwright test tests/RegistrationTests.spec.ts          # registration spec
npx playwright test -g "TC116:"                             # filter by test case ID
npx playwright test --headed                                 # watch the browser
npx playwright test --project=chromium                       # one browser project
```

The suites cover registration, login/logout, product search and category/brand browsing, with 47 cases across four specs.

## Environment flags

Consumed by the `utils/` facades and the root lifecycle scripts
(`global-setup.ts` / `src/utils/AllureReport.ts`):

| Flag | Consumed by | Default | Effect |
|---|---|---|---|
| `AUTO_ALLURE_OPEN` | `src/utils/AllureReport.ts` | on (opt-out) | Set to `false` to skip auto-opening the generated Allure report after the run. |
| `HARNESS_ALLURE_HISTORY` | `src/utils/AllureReport.ts` and scoped harness commands | `reports/allure-history` | Select a shared history root under the consumer's `reports/` directory. |
| `API_CONSOLE_LOGS` | `utils/ApiActions.ts` | off (opt-in) | Set to `true` to mirror every API request/response to the console (report attachments are always written). |
| `DB_CONSOLE_LOGS` | `utils/DBActions.ts` | off (opt-in) | Set to `true` to mirror every SQL query/result to the console (report attachments are always written). |

PowerShell sets these as `$env:AUTO_ALLURE_OPEN='false'`; bash inline as
`AUTO_ALLURE_OPEN=false npx playwright test`.

**CI runs** must stay headless and non-interactive: set `CI=true`
(disables desktop behavior and enables retries/`forbidOnly` in the config),
`AUTO_ALLURE_OPEN=false`, and `PW_TEST_HTML_REPORT_OPEN=never` (suppresses the
HTML reporter's `open: 'always'` server), as the harness package's optional
CI templates demonstrate.

```bash
CI=true AUTO_ALLURE_OPEN=false PW_TEST_HTML_REPORT_OPEN=never npx playwright test --project=chromium
```

## GitHub Actions

[The workflow](.github/workflows/playwright.yml) runs the full configured suite with
`npm test` on pull requests targeting `main`, pushes to `main`, and manual dispatch.
It installs Node 24, locked dependencies and Chromium on an Ubuntu runner.
The existing CI configuration uses one worker and two retries.

Every completed test run uploads two separate HTML files, `playwright-report.html`
and `allure-report.html`, retained for 30 days. Copies are taken from
`reports/playwright-report/index.html` and the single new
`reports/allure-history/<timestamp>/index.html`; these uploads use
`archive: false` rather than ZIP archives. Both preparation/upload pairs run after
test failures, while the job keeps the failed test outcome. A missing report fails
its preparation/upload. Download the individual HTML artifacts from the Actions run
page and open them in a browser. Playwright's external screenshot/video/trace files
are outside this HTML-only export. A separate `allure-history` ZIP artifact retains
the entire Allure history root, including `latest.html`, its relative target, raw
results and generation receipts, with the same 30-day retention and failure behavior.
Download and extract the whole bundle before opening `latest.html`. Allure uses its
existing single-file configuration and is generated after native reporters flush.
The current public QA target and disposable test accounts require no repository secrets.

This executes the 47 committed automated cases. The fifteen unresolved story 87
cases remain documented in [the status table](docs/story-87-status.md); they are not
included as passing automation. TC126 has a known QA behavior mismatch, so a full run
may fail while still providing both report artifacts.

## Report locations

One run produces (mirrors the `reporter` array in `playwright.config.ts`):

| Report | Location | Produced by |
|---|---|---|
| Console list | terminal output | `list` reporter |
| Playwright HTML report | `reports/playwright-report/` | `html` reporter (`open: 'always'` locally) |
| Allure raw results | `allure-results/` (explicit `resultsDir`; `outputFolder` is unsupported) | `src/utils/AllureReport.ts`, extending `allure-playwright` |
| Allure 3 single-file HTML | `reports/allure-history/<timestamp>/index.html` — one report per invocation, not trend history | `src/utils/AllureReport.ts`, after all reporters flush |
| Latest Allure entry point | `reports/allure-history/latest.html` — relative link to the last completed report | Maintained harness generator |
| Preserved Allure run evidence | Beside each Allure HTML: `run.json`, `allure-results/`, `capture.json`, `generation.json` | Maintained harness capture and generator |
| JSON results | `reports/json-report/test-results.json` | `json` reporter |
| JUnit XML (CI Tests tab) | `reports/junit/results.xml` | `junit` reporter |
| CTRF JSON | `ctrf/ctrf-report.json` | `playwright-ctrf-json-reporter` |

New timestamps use UTC `YYYY-MM-DD_HH-mm-ssZ`, with numeric suffixes for collisions.
Existing report folders and links remain readable. History now holds the sole native
report per invocation; `ALLURE_HISTORY` and `keepHistory` are obsolete. To disable
optional Allure output, remove its reporter or omit verification's `--allure`.
For `generate-allure --input`, pass the exact recording directory returned by capture
or verification rather than deriving it from a verification ID.

> **Keep this table honest:** any reporter or path change in
> `playwright.config.ts` lands in lockstep — same MR — across the config,
> `global-setup.ts`/`src/utils/AllureReport.ts`, this table, and the CI artifact steps
> (design-conventions, *Report output contract*).

The report generator is pinned to `allure` 3.19.1 and configured in `allurerc.json`.
It runs on Node, without Java. Tests and action methods retain their existing
`allure-js-commons` calls. The report keeps epic/feature/story grouping, embedded
attachments and the existing output paths. Generation occurs in the reporter's
`onExit`, not `globalTeardown`, so environment details and results have finished
writing. Keep this reporter before the HTML viewer, which can hold its exit hook
open in a local terminal. It cannot override native test outcomes. The generated HTML blocks
outbound requests, including the upstream template's analytics script.
