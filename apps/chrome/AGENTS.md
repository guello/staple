# Staple for Chrome

Manifest V3 Chrome extension with small tab utilities behind keyboard commands. The repository commands, gates and conventions are in the root `AGENTS.md`.

## Commands

Run these in `apps/chrome`, or from the root with `pnpm --filter staple-chrome run <script>`.

- `test`: `test()` from `@staple/tools` bundles every `src/**/*.test.ts` and runs each on `node:test`.
- `build`: `bundle()` from `@staple/tools` bundles the three entry points into `dist/`, plus static files.
- `watch`: Rebuilds on change. No HMR: reload from `chrome://extensions` after each build.
- `package`: The root `pnpm run ci`, then `build`, then zips `dist/` into `staple-chrome-<version>.zip`.

## Architecture

- `src/background.ts` is the service worker. It calls one `registerX()` for each feature.
- A feature is a folder under `src/features/`. Its `index.ts` owns the Chrome API calls, and pure sibling modules hold the decisions.
- `src/lib/` is the shared layer, and `src/ui/` holds the tokens and DOM helpers of the popup and the options page.
- The full layout and the message flow are in `.agents/references/architecture.md`.

## Hard rules

- Manifest V3 and Chrome only. Use the `chrome.*` namespace directly: no `webextension-polyfill`, no `browser.*`.
- Ship no UI framework and no runtime dependency: only vanilla TypeScript and hand-written CSS.
- Add a dev dependency only for a need that no platform API covers.
- `storage` is the only permission. Justify a new permission in the commit that adds it.
- Tab titles and URLs are untrusted. Build DOM through `element()` and `icon()` in `src/ui/dom.ts`, never `innerHTML`.
- No network at runtime: no remote fonts, scripts or favicons. The popup must paint immediately.

## Read next

Paths below are relative to `apps/chrome`. Before the edit, read the file of each row that applies.

| Work                                                                  | Read                                                                    |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Edit `src/features/`                                                  | `.agents/rules/features.md`. It lists deliberate guards that must stay. |
| Edit `src/ui/`, `src/action/` or `src/options/`                       | `.agents/rules/ui.md`                                                   |
| Edit `manifest.json`                                                  | `.agents/rules/manifest.md`                                             |
| Change the layout, the message flow or the shared modules             | `.agents/references/architecture.md`                                    |
| Change the build, the test runner, the types or the platform baseline | `.agents/references/stack.md`                                           |
| Add a feature or a command, or check behavior in a real browser       | `.agents/references/workflows.md`                                       |
| Package, tag or publish                                               | The root `.agents/references/release.md`                                |
