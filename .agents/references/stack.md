# Stack decisions

Why the repository toolchain looks the way it does, and what can justify a change. The app stacks are in `apps/chrome/.agents/references/stack.md` and `apps/vscode/.agents/references/stack.md`.

Read this before you propose a task runner, a new shared package or a different gate.

## Workspace

- pnpm workspaces with no task runner. Each build takes about 1 s, so a task cache gains nothing.
- Revisit when one package check or build takes more than about 30 s, or when CI runs more than 4 packages.
- At that point, try `pnpm pipeline` first, then Turborepo.
- Rejected: Turborepo, Nx, moon and Vite+. Turborepo gains little at this size, and Nx is a large install with cloud prompts.
- moon overlaps nodenv and Corepack. Vite+ pins its own oxlint and oxfmt and moves their config into `vite.config.ts`.
- Node comes from `.node-version` through nodenv. pnpm comes from `packageManager`.

## Gates

- oxfmt, oxlint, knip and `tsc --noEmit` run from the root, in parallel through `pnpm check`.
- oxlint nested configs do not merge, and `typeAware` is valid only at the root.
- So `.oxlintrc.json` is the single config, with an `overrides` entry for each app difference.
- oxfmt has no `extends`. The `vscode` import group is an override in `.oxfmtrc.json`.
- knip uses one `knip.json` with a workspace for each package.
- `tsc --noEmit` runs once in each package. Project references help only when packages import the types of each other.
- The gates run on TypeScript 7. If a 7.x release breaks `tsc` or the type-aware lint rules, pin `^5.9` and record why here.
- The Git hooks are plain scripts in `.githooks/`, and `prepare` sets `core.hooksPath`. The full `pnpm run check` takes about 1 s, so staged-file filters save nothing.
- Move to lefthook when the pre-commit gate takes more than 5 s. Also move when a hook must run only for changed paths. Install it from `prepare` with `lefthook install`, and set `lefthook: false` in `allowBuilds`.

## Dependencies

- The gate tools live only in the root `devDependencies`.
- `esbuild` and `typescript` come from the strict catalog in `pnpm-workspace.yaml`, so every package uses one version.
- Platform types stay in the package that needs them: `chrome-types`, `@types/vscode`, and `@types/node` in each package.
- pnpm enforces a minimum release age, so `pnpm update --latest` stops one version short of a package from the last day.
- Never force a newer version with `pnpm add <pkg>@<version>`. pnpm then writes a permanent `minimumReleaseAgeExclude` entry.

## CI

- `.github/workflows/ci.yml` runs on each push to `main` and on each pull request.
- The `gates` job runs `pnpm run check` on the whole workspace. On a pull request, it also runs commitlint on each commit.
- The `app` job runs `test` and `build` only for the apps that the change touches. A change outside `apps/` runs every app.
- The `ci` job fails when any other job fails. Make it the only required check, so that a skipped app job does not block a merge.
- The jobs read the Node version from `.node-version` and the pnpm version from `packageManager`. Do not write versions into the workflow.

## Shared code

- `packages/tools` (`@staple/tools`) holds the build code that two or more apps use: `bundle()` and `test()`.
- Code that only one app uses stays in that app, for example the Taplo wasm plugin and the Chrome zip step.
- Move code into a package only when a second consumer needs it.
- Repository tasks, such as a release command, go in the root `scripts/` directory, not in a package.
