@AGENTS.md

<!-- playwright-pom-harness -->
Use the harness skills linked under `.claude/skills` and `.agents/skills`; resolve linked skills to their real package path for references. To install, update or configure the harness, follow the `harness-setup` skill. If the harness skills are missing, run `npx --no pom-harness setup`. Keep package content immutable and consumer state under `.harness`. Preserve this project's existing instructions and code. Imported team libraries are derive-only.

Use `context-qa` only when the user explicitly invokes its discovered skill command or mention. Ordinary project, business, repository and general questions do not activate it. Its captured-only boundary applies to the invoked request and necessary clarifications, then ends; later snapshot-only answers require another explicit invocation. Within explicit Q&A, answer only from one selected saved snapshot using local `context read` / `context search`; cite its revision and evidence, disclose gaps and never silently retrieve or refresh sources. Reuse an established compatible context ID when explicitly invoked again; clarify only missing or ambiguous scope. Other messages use normal workflows. Use `project-context` for explicit source retrieval and `context-update` for explicit save/update/refresh requests. Preserve host-native permissions.

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

No features recorded yet. Run `memory init --brief` for the indexing brief.
<!-- memory:map:end -->
