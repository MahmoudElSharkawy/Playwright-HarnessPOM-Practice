@AGENTS.md

<!-- playwright-pom-harness -->
Use the harness skills linked under `.claude/skills` and `.agents/skills`; resolve linked skills to their real package path for references. To install, update or configure the harness, follow the `harness-setup` skill. If the harness skills are missing, run `npx --no pom-harness setup`. Keep package content immutable and consumer state under `.harness`. Preserve this project's existing instructions and code. Imported team libraries are derive-only.

Use `context-qa` only when the user explicitly invokes its discovered skill command or mention. Ordinary questions do not activate it. Its captured-only boundary covers the invoked request and necessary clarifications, then ends; later snapshot-only answers require another invocation. Answer only from selected saved business work items and documents using local `context read` / `context search`. Explain the business directly with readable work-item/document citations; keep hashes and storage diagnostics internal unless requested. Never silently fetch or refresh missing evidence. Reuse an established compatible context ID; clarify only ambiguous scope. Use `project-context` to build, retrieve or update selected business context with saved or new criteria, and `context-update` to refresh saved selection. Exact IDs stay fixed; criteria discover new matching items. Only explicitly selected attachments are included. Repository/POM/code/configuration content is outside business context. Preserve host-native permissions.

Use `test-case-design` to design or revise source-grounded cases from a selected story or supplied requirements, review full cases in chat, and optionally publish an approved selection. Reuse the requirements acceptance inventory and selected business context; do not implicitly invoke context-qa or refresh context. Case publication does not establish execution or automation success.

Never commit or push directly to the default branch. Reuse the ongoing feature branch and add commits; otherwise create one named `automation/<source-id>-<slug>` for generated suites, `harness/<topic>` for harness setup or updates, `feature/<topic>` for new framework code, or `fix/<topic>` for fixes. Deliver through a pull request, and commit, push or open one only with the user's authorization.
<!-- /playwright-pom-harness -->

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

**Recent decisions:** story-86-quality-expectations — Story 86 quality expectations
<!-- memory:map:end -->
