# Chrome stack decisions

Why the Chrome toolchain looks the way it does, and what can justify a change. Read this before you propose a different build tool, test runner or type package.

## Build tooling

The candidates got a generic score first, then a fit score for this project: parity with the VS Code app, few dependencies, and plain Chrome patterns.

| Candidate               | Generic score | Fit       |
| ----------------------- | ------------- | --------- |
| Custom esbuild scripts  | 6/10          | Chosen    |
| CRXJS Vite plugin 2.7.1 | 8/10          | Runner-up |
| WXT 0.21.3              | 9/10          | Rejected  |
| Extension.js 4.0.30     | 6/10          | Rejected  |
| Plain Vite 8.2.1        | 7/10          | Rejected  |
| Plasmo 0.90.5           | 2/10          | Rejected  |

- Custom esbuild scripts share `@staple/tools` with the VS Code app, and a hand-written `manifest.json` is the most Chrome-native pattern. The cost is no HMR.
- CRXJS is plain Vite plus a typed manifest that you own, with real HMR and 14 dependencies. A stable v2 shipped in mid-2025.
- WXT has the best maintenance and testing, but it is a framework: a generated manifest, file conventions, auto imports and 35 CLI dependencies.
- Extension.js is based on Rspack, and installs Vue, Preact and Svelte loaders for a vanilla TypeScript project.
- Plain Vite gains nothing over esbuild: its HMR client cannot run on `chrome-extension://` pages without CRXJS glue.
- Plasmo had no commit or release for 15 months, and 371 open issues.

Revisit the choice only on one of these triggers:

- When reload friction slows sustained UI work, move to CRXJS and keep the hand-written manifest.
- When the extension must also target Firefox or Safari, or gets many entry points such as content scripts and devtools panels, move to WXT.

## Locked stack

- Build: esbuild through `bundle()` from `@staple/tools`, called by `scripts/build.mts`. The output is ESM, because the service worker has `"type": "module"`.
- Types: `chrome-types`, which Google generates daily from Chromium and recommends over `@types/chrome` for Manifest V3.
- `tsconfig.json` lists `chrome-types` and `node` in `types`. It extends the root `tsconfig.json` and adds the DOM libs and the `@/*` alias.
- Tests: `node:test` and `node:assert/strict`, through `test()` from `@staple/tools` with `globals: ['chrome']`.
- The test stub is `globalThis.chrome ??= {}` and nothing more, so testable logic must go in pure modules.
- No polyfill: under Manifest V3, `chrome.*` returns promises, and Chrome 148 added a native `browser` namespace.
- End to end: none. For a smoke test, add Playwright with the first script, and use `launchPersistentContext` with `--load-extension=dist`.

## Platform baseline

- Manifest V3 only. Chrome and the store removed Manifest V2 in 2025 and 2026.
- `minimum_chrome_version` is `121`, with the esbuild `chrome121` target. `tab.lastAccessed` sets the floor, and all other APIs in use are older.
- Raise both together, and only after a check of the `@since` of the API that needs it.
- Chrome stops the service worker after about 30 seconds idle. So the state goes to `chrome.storage.session`, and each command reads live queries.
