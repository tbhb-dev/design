# Agent instructions

This is tbhb-dev/design, the design system for tbhb.dev projects: a pnpm workspace of npm packages under the `@tbhb-dev` scope.

## Standing rules

- Never publish a package to npm. Publishing needs @tbhb's credentials and decision. Every package keeps `"private": true` until @tbhb says otherwise.
- Never write a public IP address in a commit or a pull request. The `public-ipv4` gitleaks rule enforces this.
- Secrets live in 1Password only. Never paste one into chat or commit one to git.

## Layout

Put each package in its own directory under `packages/`, named for the package without its scope, with its own `package.json` and a `BUILD.bazel` that calls `repo_files()`. Add a new package's `package.json` to the `data` of `npm_translate_lock` in `MODULE.bazel`. Keep only configuration at the repository root.

The TypeScript checks from `@tbhb_rules_typescript//:defs.bzl` (`tsc_test`, `biome_test`, `eslint_test`, `knip_test`, `depcruise_test`, `vitest_test` and `stryker_test`) join the root `BUILD.bazel` in the change that adds the first package source, because each one fails on an empty tree. Those tools come from `tbhb_rules_typescript`. Never add them to a `package.json`. After changing a `package.json`, regenerate the lock with `bazelisk run -- @pnpm//:pnpm --dir "$PWD" install --lockfile-only`.

## Commits and pull requests

- Branch first. Every change lands through a pull request.
- Use Conventional Commits and a plain `git commit`, without `Signed-off-by` or `Co-authored-by`, and fill every section of `.github/PULL_REQUEST_TEMPLATE.md`.

## Checks

Run `mise install` and `bazelisk run //:bazel_env`, which builds the `.bazel_env/bin` shims the git hooks call, then `tbhbdev alpha install` once per clone. It installs the git hooks and the user-level harness hooks, and its SessionStart hook reinstalls the git hooks in each new worktree. Every gate is a Bazel test from tbhb-dev/rules, which `bazelisk test //...` runs, and `bazelisk run //:format` rewrites files into their canonical format. The pre-commit hooks run the same gates. To build against a local rules clone, put `common --override_module=tbhb_rules=<path to a rules clone>` in `.bazelrc.user`.
