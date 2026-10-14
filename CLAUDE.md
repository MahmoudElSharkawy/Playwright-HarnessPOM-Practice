<!-- playwright-pom-harness -->
Use the harness skills linked under `.claude/skills` and `.agents/skills`; resolve linked skills to their real package path for references. To install, update or configure the harness, follow the `harness-setup` skill. If the harness skills are missing, run `npx --no pom-harness setup`. Keep package content immutable and consumer state under `.harness`. Preserve this project's existing instructions and code. Imported team libraries are derive-only.

Never commit or push directly to the default branch. Reuse the ongoing feature branch and add commits; otherwise create one named `automation/<source-id>-<slug>` for generated suites, `harness/<topic>` for harness setup or updates, `feature/<topic>` for new framework code, or `fix/<topic>` for fixes. Deliver through a pull request, and commit, push or open one only with the user's authorization.
<!-- /playwright-pom-harness -->
