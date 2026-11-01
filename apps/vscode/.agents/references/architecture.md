# VS Code app architecture

How `apps/vscode` is put together. Paths are relative to `apps/vscode`.

## Entry point

- `src/extension.ts` is the only module that VS Code loads.
- Its `activate()` calls one `activate<Name>(context)` for each feature and returns the markdown API.
- `contributes.markdown.markdownItPlugins` in `package.json` gives that API to the built-in preview.
- `deactivate()` exists only to stop the TOML server.

## Features

- A feature is one file under `src/features/`, or a folder when it needs more than one module.
- The `index.ts` of a folder owns every `vscode.*` call. Its siblings hold the decisions as pure functions, each with a colocated `*.test.ts`.
- `scripts/test.mts` replaces the `vscode` module with an empty object, so only the pure modules have unit tests.
- The feature contract is in `.agents/rules/features.md`. Settings are read at use time, so a change applies without a reload.

## TOML process model

TOML is the only feature that runs out of process, and the reason for the three esbuild entry points.

- `src/features/toml/index.ts` runs in the extension host. Its state machine starts the client when a TOML document opens and stops it when the last one closes.
- It loads `client.ts` through a runtime `import()` of the URL of the built file. A user who opens no TOML file never loads `vscode-languageclient`.
- `client.ts` starts `server.js` as a separate Node process over IPC. `server.ts` connects that channel to the Taplo wasm module.

## Build

- `scripts/build.mts` emits CJS for `node20` with `vscode` external.
- It runs `scripts/generate-github-markdown.mts` in parallel to write the preview stylesheets.
- Git ignores everything under `dist/`. Never edit or commit it.
