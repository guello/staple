# Staple for VS Code

Visual Studio Code extension with small editor utilities that replace seven separate installs.

The repository commands, gates and conventions are in the root `AGENTS.md`.

## Commands

Run these in `apps/vscode`, or from the root with `pnpm --filter staple run <script>`. The package name `staple` sets the extension id `guello.staple`.

- `test`: `test()` from `@staple/tools` bundles every `src/**/*.test.ts` and runs each on `node:test`.
- `build`: `bundle()` from `@staple/tools` bundles the three entry points and writes the preview CSS.
- `watch`: Like `build`, but unminified with inline source maps, and rebuilds on every save.
- `package`: The root `pnpm run ci`, then `vsce package --no-dependencies` into `staple-vscode-<v>.vsix`.
- `deploy`: `package`, then installs the vsix into VS Code. Reload the window afterwards.
- `generate:ghostty`: Rewrites `languages/ghostty/reference/` from the installed Ghostty. Run after an upgrade.

## Architecture

- `src/extension.ts` is the only module that VS Code loads.
- A feature is one file under `src/features/`, or a folder with an `index.ts` and pure sibling modules.
- The full layout, the feature contract and the TOML process model are in `.agents/references/architecture.md`.

## Hard rules

- The only runtime dependencies are `@taplo/lsp` and `vscode-languageclient`, both for TOML. All other code is vanilla TypeScript on the `vscode` API.
- Add a runtime dependency only for a need that the platform does not cover.
- `@types/vscode` must never be higher than `engines.vscode`. Otherwise the code compiles against APIs that the oldest supported editor does not have.
- Keep `@types/vscode` pinned with `~`. Raise it together with `engines.vscode`, and only for an API that needs it.
- `.vscodeignore` is an allowlist. Add each new shipped directory there, or the vsix does not include it.
- Declare every setting that a feature reads in `contributes.configuration`, with the default that the code falls back to. A different default is a bug.
- Never write to user settings without a setting that controls the write. Only `ghostty-syntax/index.ts` writes, and only the globs that it added.
- `staple.ghosttySyntax.autoAssociations` turns that write off and reverts the globs.

## Read next

Paths below are relative to `apps/vscode`. Claude Code loads each rule on its path glob through the `.claude/rules` link. Other agents must read the matching file before the edit.

### Rules

- When you edit `src/features/`: `.agents/rules/features.md`. It lists deliberate guards that must stay.
- When you edit `src/features/ghostty-syntax/` or `languages/ghostty/`: `.agents/rules/ghostty.md`.
- When you edit `src/features/toml/`: `.agents/rules/toml.md`.
- When you edit the markdown feature, its generator or `media/markdown/`: `.agents/rules/markdown-preview.md`.
- When you edit `package.json`: `.agents/rules/contributes.md`. It lists what must agree, and what nothing checks.

### References

- When you change `src/extension.ts`, the feature contract, the TOML process model or the build entry points: `.agents/references/architecture.md`.
- When you change the build, the test runner, the types or the editor baseline: `.agents/references/stack.md`.
- When you add a feature or a command, or check behavior in a real editor: `.agents/references/workflows.md`.
- When you package, tag or publish: the root `.agents/references/release.md`.
