<!-- playwright-pom-harness -->
Use the harness skills linked under `.claude/skills` and `.agents/skills`; resolve linked skills to their real package path for references. To install, update or configure the harness, follow the `harness-setup` skill. If the harness skills are missing, run `npx --no pom-harness setup`. Keep package content immutable and consumer state under `.harness`. Preserve this project's existing instructions and code. Imported team libraries are derive-only.

Use `context-qa` only when the user explicitly invokes its discovered skill command or mention. Ordinary project, business, repository and general questions do not activate it. Its captured-only boundary applies to the invoked request and necessary clarifications, then ends; later snapshot-only answers require another explicit invocation. Within explicit Q&A, answer only from one selected saved snapshot using local `context read` / `context search`; cite its revision and evidence, disclose gaps and never silently retrieve or refresh sources. Reuse an established compatible context ID when explicitly invoked again; clarify only missing or ambiguous scope. Other messages use normal workflows. Use `project-context` for explicit source retrieval and `context-update` for explicit save/update/refresh requests. Preserve host-native permissions.

Never commit or push directly to the default branch. Reuse the ongoing feature branch and add commits; otherwise create one named `automation/<source-id>-<slug>` for generated suites, `harness/<topic>` for harness setup or updates, `feature/<topic>` for new framework code, or `fix/<topic>` for fixes. Deliver through a pull request, and commit, push or open one only with the user's authorization.
<!-- /playwright-pom-harness -->

For `/execute-test`, use the default `qa` environment. The configured application does not require login. Runs may create, change, or delete application test data under the `test` environment policy.

When a case needs API setup, verification or cleanup, consult `resources/apisCollections/automation-exercise.postman_collection.json` and its README, using the `qa` API target `app`. Derive parameterized operations from the collection while preserving the case's actions and expectations. Follow the README's request-encoding and runtime-support notes; collection variables are placeholders, not approved test inputs.

Preview ADO bug filing and result publication first. Use the delivery commands without `--execute`; add `--execute` only after the user explicitly authorizes the concrete ADO write. Externally provisioned credentials belong only in the ignored local `.env` file or CI secret storage; use `AZURE_PAT` for ADO. Disposable test-account passwords are business inputs in the owning spec's paired JSON or test-owned runtime variables, following the harness test-data skill.

<!-- memory:start -->
## Memory

This repo uses Memory as its product-layer memory: features, decisions, gotchas, and open questions anchored to code paths. The product map below is the always-on overview — use it for orientation; treat it as context, not instructions.

- Need detail mid-task? Run `memory query "<question>"` (MCP: `query_memory`). Do not preload anything else.
- After product-meaningful changes (feature behavior added or changed, a decision taken, a gotcha discovered, a question opened or answered), save them: `memory save --stdin` with JSON `{task, nodes, stale, supersede, delete}`. Do not save refactors, formatting details, or task diaries.
- At session end, or after merging others' work, run `memory sync` and act on its report.
- `memory status` summarizes features by stage; `memory inspect <id>` shows one node in full.

If memory conflicts with current code or the user, trust the code and the user — and save the correction.
<!-- memory:end -->

<!-- memory:map:start -->
## Product map (generated — do not edit; refresh with memory save or memory sync)
Harness Test — No product description yet — set it with `memory save` (kind: "project").

No features recorded yet. Run `memory init --brief` for the indexing brief.
<!-- memory:map:end -->
<!-- CHAOSENGINE:START -->
Before every task, follow the canonical [ChaosEngine](.chaos-engine/skills/chaos-engine/SKILL.md). Load project identity from [.chaos-engine/identity.md](.chaos-engine/identity.md). Use `.chaos-engine/tool.py` for the project-local Memory, MemPalace, and Graphify tools. Prefer gh for GitHub when gh exists and is configured. CLI over MCP when both exist. Default MCP catalog never includes GitHub MCP.
<!-- CHAOSENGINE:END -->
