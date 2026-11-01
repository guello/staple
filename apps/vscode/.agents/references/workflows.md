# VS Code app workflows

Step lists for `apps/vscode`. Paths are relative to `apps/vscode`.

## Adding a feature

1. Create `src/features/<name>.ts`, or `src/features/<name>/index.ts` when it needs siblings, that exports `activate<Name>(context)`.
2. Call it from `src/extension.ts`.
3. In `contributes.configuration.properties` of `package.json`, add `staple.<name>.enabled` and the other keys.
4. Give each key a `scope`, and the default that the code uses.
5. Add the commands, menus and keybindings in `contributes`, with `when` and `enablement` clauses on the settings.
6. Check each command id against its `registerCommand` call by hand. A typo fails only at runtime.
7. Add a README section with a settings table.
8. Add each new entry point to `entry` of the `apps/vscode` workspace in the root `knip.json`. Otherwise knip reports the file as unused.

## Verifying behavior

The gates never touch the VS Code API. A green `pnpm run ci` covers only the pure logic, and a change to `vscode.*` code needs the extension loaded.

1. For the edit loop, run `pnpm watch` in `apps/vscode`.
2. In the same directory, open an Extension Development Host with `code --extensionDevelopmentPath="$PWD"`.
3. After each rebuild, press `cmd+r` in that window. The host replaces the installed copy in that window only, and has no hot reload.
4. For a final check in your own windows, run `pnpm run deploy` in `apps/vscode`, then reload the window.
5. Before the first deploy, uninstall an older `guello.staple-vscode` build. Otherwise both copies run.
6. Read the Extension Host output channel for activation errors. A throw in `activate()` shows nowhere else.

## Feature checks

Some features need their own check:

- Markdown: open a preview under a light theme and a dark theme.
- TOML: open and close the last TOML file, and confirm that the server starts and stops.
- Git refresh: run a git command in a terminal and watch the Source Control view update.
