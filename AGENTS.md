# Staple

Staple is a set of small developer extensions in one pnpm workspace. Each extension ships on its own, with its own version, changelog, tag and release artifact.

## Layout

| Path             | Package         | What it is                                                                |
| ---------------- | --------------- | ------------------------------------------------------------------------- |
| `apps/chrome`    | `staple-chrome` | Manifest V3 Chrome extension with tab utilities.                          |
| `apps/vscode`    | `staple`        | VS Code extension with editor utilities.                                  |
| `packages/tools` | `@staple/tools` | `bundle()` and `test()`, the build and test helpers that both apps share. |

Each app has its own `AGENTS.md`. Read it before you work in that app.

## Commands

Node comes from `.node-version` through nodenv, and pnpm from `packageManager` through Corepack. Run these at the root:

| Command        | What it runs                                                                 |
| -------------- | ---------------------------------------------------------------------------- |
| `pnpm install` | Installs every package and points Git at `.githooks/` through `prepare`.     |
| `pnpm check`   | oxfmt check, knip, oxlint and `tsc --noEmit` for every package, in parallel. |
| `pnpm test`    | The `test` script of every package.                                          |
| `pnpm run ci`  | `pnpm check`, then `pnpm test`.                                              |
| `pnpm build`   | The `build` script of every package.                                         |
| `pnpm fix`     | Lint fixes plus formatting. Use it instead of hand fixes.                    |

Run an app script with `pnpm --filter <package> run <script>` or `pnpm run <script>` in the app directory.

The hooks run `pnpm run check` before a commit, commitlint on the message, and `pnpm run ci` before a push.

CI runs the same gates on each push to `main` and on each pull request. All jobs are in `.agents/references/stack.md`.

## Workspace rules

- Gate configs exist only at the root. Put an app difference in an override in `.oxlintrc.json` or `.oxfmtrc.json`, or in the app workspace of `knip.json`.
- Gate tools go in the root `devDependencies`. Platform types stay in each package.
- Build tools that more than one package uses go in the strict catalog of `pnpm-workspace.yaml`.
- A package depends on another package with `workspace:*`.
- Shared code moves to `packages/` only when a second app needs it. Repository tasks go in the root `scripts/`.
- oxfmt, oxlint, knip and tsc own formatting and style. Do not restate their rules in a review.

## Adding an app

1. Create `apps/<name>/` with a private `package.json` that has `build`, `test` and `check:types` scripts.
2. Extend the root `tsconfig.json` from its own `tsconfig.json`, and set `include` there.
3. Add its workspace to `knip.json`, and an override to `.oxlintrc.json` for its environment.
4. Add `<name>` to `scope-enum` in `.commitlintrc.json`.
5. Add its `AGENTS.md` and a row in the layout table above. Do not add a `CLAUDE.md`: Claude Code reads `AGENTS.md`.
6. Put its rules in `apps/<name>/.agents/rules/` as plain Markdown. Route each one from a row of the app `AGENTS.md` table, with a path relative to the app.

## Conventions

- Commits follow Conventional Commits, enforced by commitlint: `type(scope): description`.
- The scope is the app directory (`chrome`, `vscode`), or `ci`, `deps`, `release` or `tools`. A change to root files can omit the scope.
- commitlint limits body lines to 100 characters.
- Commits and tags are signed.
- Prefer platform APIs and small hand-written scripts to frameworks. A new dependency needs a reason that the platform cannot cover.

## Read next

Each app keeps its rules and references in `apps/<app>/.agents/`, and the table in the app `AGENTS.md` routes each one. Before the work, read the file of each row below that applies.

| Work                                                                  | Read                            |
| --------------------------------------------------------------------- | ------------------------------- |
| Any work in `apps/chrome`                                             | `apps/chrome/AGENTS.md`         |
| Any work in `apps/vscode`                                             | `apps/vscode/AGENTS.md`         |
| Change the workspace, the gates, the dependencies or `packages/tools` | `.agents/references/stack.md`   |
| Package, tag or publish an app                                        | `.agents/references/release.md` |
