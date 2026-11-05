# Design

This repository is the design system for tbhb.dev projects. It's a pnpm workspace whose packages publish to npm under the `@tbhb-dev` scope.

## Packages

| Package | Directory | Status |
| --- | --- | --- |
| `@tbhb-dev/tokens` | `packages/tokens/` | Empty, private, unpublished |

## Workflow

Every change lands through a pull request. See [AGENTS.md](AGENTS.md) for the setup and the rules.

## Checks

Bazel runs every gate from tbhb-dev/rules: `bazelisk test //...`. The TypeScript checks arrive with the first package source.
