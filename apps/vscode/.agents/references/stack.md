# VS Code stack decisions

Why the VS Code toolchain looks the way it does, and what can justify a change.

Read this before you propose a different bundler, test runner or type package, and before you raise a major version.

## Locked stack

- Build: esbuild through `bundle()` from `@staple/tools`, called by `scripts/build.mts` on the native TypeScript support of Node.
- The build has three entry points, `outbase: src`, minification and `vscode` as external. Its only plugin is the local `taplo-wasm` plugin.
- Output: CJS, because the extension host loads `main` as CommonJS. The source is ESM.
- The `taplo-wasm` plugin rewrites the wasm loader to `require('node:fs')` and `__dirname`, which exist only in CJS.
- Language: TypeScript with `strict`, an ES2022 target, `bundler` resolution and `noEmit`, because esbuild emits the code.
- `allowImportingTsExtensions` is on, so that `scripts/*.mts` files import each other by full file name, as Node type stripping requires.

## Tests and gates

- Tests: `node:test` and `node:assert/strict`, through `test()` from `@staple/tools` with `modules: ['vscode']`.
- The test stub resolves `vscode` to an empty object, so testable logic must go in pure modules.
- Gates: the gates in the root `.agents/references/stack.md`. No ESLint, no Prettier and no other test framework.
- Runtime dependencies: `@taplo/lsp` and `vscode-languageclient`. Only the TOML feature uses them, and it loads them lazily.

## Version constraints

These four couplings break with no error when a bump ignores them:

- `@types/vscode` must not be higher than `engines.vscode`. A caret lets `pnpm update --latest` raise the types past the floor, so it is pinned with `~`.
- With newer types, the code compiles against APIs that the oldest supported editor does not have, and `vsce` does not catch every case.
- `vscode-languageclient` 10 declares `engines.vscode: ^1.91.0`, which sets the floor. A newer client raises it, and `@types/vscode` moves with it.
- The esbuild `target` follows the Node version that the oldest supported VS Code embeds, now `node20`. It moves only with `engines.vscode`.
- A new `@types/node` major can change strictness without a Node upgrade. Version 26 made `process.disconnect` optional, so `server.ts` calls it through `?.()`.

## Editor baseline

- Only `vscode-languageclient` 10 sets `engines.vscode` to `^1.91.0`. No API in the source needs it.
- Raise the floor only for a dependency or an API that needs it, and check the `@since` of that API first.
- The extension is not web-compatible and declares no browser entry point.
- A web build must first remove three Node uses: `node:child_process` in `optimize-images.ts`, the Node process of `toml/client.ts`, and the Taplo wasm read.

## Not adopted

- A bundler framework: no webpack, rollup, tsup or `@vscode/test-cli`. Both apps share `bundle()` and `test()`, so they keep one build shape.
- An integration test runner: `@vscode/test-electron` lets tests drive a real editor. Add it with the first test that needs a real editor, not before.
- `@types/markdown-it`: `src/features/markdown/markdown-it.ts` declares the four interfaces that the plugin uses. The package adds a transitive tree.
