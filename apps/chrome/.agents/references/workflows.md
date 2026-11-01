# Chrome app workflows

Step lists for `apps/chrome`. Paths are relative to `apps/chrome`.

## Adding a command

Five places must agree. Nothing compares the manifest to the source.

The type check covers only one link: a new `COMMAND_IDS` entry fails the build until the popup has a row for it.

1. `manifest.json` `commands`: id, description, optional `suggested_key`. All four allowed defaults are in use, so a new default replaces one.
2. `COMMAND_IDS` in `src/lib/commands.ts`.
3. `registerCommand(id, handler)` inside the owning feature's `registerX()`.
4. `PRESENTATION` in `src/action/action.ts`: label plus an inline icon path. The record is keyed by `CommandId`, so a missing entry fails the typecheck.
5. The shortcuts table in `README.md`.

## Adding a feature

1. `src/features/<name>/index.ts` exporting `register<Name>()`, called from `src/background.ts`.
2. `src/lib/settings.ts`: `<feature>.enabled` and its other keys in `Settings`, `BooleanSettingKey`, the defaults and the `getSettings` mapping.

   The mapping parses key by key and falls back to the default rather than spreading stored values in.

3. `src/lib/features.ts`: name, one-line description, enabled key.
4. `src/options/options.ts`: a `SETTINGS` entry. The record is keyed by `FeatureId`, so a missing one fails the typecheck.
5. A README section with a settings table.

A new entry point also goes in the `apps/chrome` workspace of the root `knip.json`, and a new static file in `staticFiles` in `scripts/build.mts`.

## Verifying behavior

`pnpm check` and `pnpm test` cover the pure logic only. A change to Chrome API code needs the extension loaded:

1. Run `pnpm --filter staple-chrome run build`.
2. In `chrome://extensions`, turn on Developer mode and load `apps/chrome/dist/` with Load unpacked.

Keyboard shortcuts cannot be synthesized from page automation.

To test a handler as the popup does:

1. Open an extension page or the worker console.
2. Send `{ type: 'run-command', command: '<id>' }` with `chrome.runtime.sendMessage`.
3. Assert the result with `chrome.tabs.query`.

Real shortcuts need a human or OS-level automation.

Stop the worker from `chrome://serviceworker-internals` to confirm state survives a restart.

Check the popup and the options page in both OS color schemes. They never follow the Chrome theme, because an extension cannot reach `chrome://theme`.
