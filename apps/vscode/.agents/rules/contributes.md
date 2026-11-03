# Manifest and contributions

`package.json` is the npm manifest and the VS Code extension manifest. Its `contributes` block is the whole declarative surface of the extension.

- No gate reads `contributes`: `tsc` and oxlint skip it, and knip checks only the dependency lists. A typo fails at runtime in the editor of a user.
- Keep the key order. oxfmt runs with `sortPackageJson: false`, and no other tool may rewrite the file.

## What has to agree

No tool checks any row of this table:

| Declaration                             | Must match                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| `contributes.commands[].command`        | the id passed to `registerCommand` or `registerTextEditorCommand`              |
| `contributes.configuration.properties`  | the section and key each feature reads, and the default the code falls back to |
| `when` and `enablement` clauses         | the setting keys they name through `config.`                                   |
| `contributes.markdown.previewStyles`    | files under `dist/features/markdown/` and `media/markdown/`, in load order     |
| `contributes.languages[].configuration` | files under `languages/`                                                       |
| `contributes.grammars[].path`           | files under `languages/`                                                       |
| `main`                                  | the esbuild output path in `scripts/build.mts`                                 |
| every shipped path above                | an allow line in `.vscodeignore`                                               |

- `.vscodeignore` excludes `**`, then allows paths back. A new shipped directory without an allow line is missing from the vsix, and all gates stay green.
- After you add a shipped path, run `pnpm --filter staple run package` and read the file list that it prints.
- Keep each declared default equal to the fallback of its `get(key, fallback)` call. One drives the settings UI, and the other drives behavior.
- When the code reads with no fallback (`mode`, `lightTheme`, `darkTheme`, `chars`, `checkboxes`), match the default to the validator that supplies it.

## Settings scope

Scope is a security boundary. A workspace, an untrusted folder included, can set any `resource` or `window` setting.

| Scope                  | Used for                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| `machine`              | `optimizeImages.app` only. A workspace value that names an executable runs code on folder open. |
| `application`          | `ghosttySyntax.*`, because the feature writes to the global `files.associations`.               |
| `language-overridable` | `toggleQuotes.*`, so that a language can have its own quote cycle.                              |
| `window`               | `markdown.*`, which the preview webview reads one time for each window.                         |
| `resource`             | all other settings.                                                                             |

- Never widen `machine` or `application` scope without a commit message that tells what a hostile workspace can then do.

## Menus, palette and keybindings

- Hide a command that needs an argument from its invocation site with `"when": "false"` under `commandPalette`, as `staple.optimizeFolderImages` does.
- Use menu `when` clauses for visibility, and also validate the argument in the handler. A keybinding or another extension can call any command.
- Give each entry in `contributes.keybindings` both `key` and `mac`. Check the VS Code default keybindings first, because a built-in wins a conflict.

## Packaging fields

- `engines.vscode` is the compatibility floor, and `@types/vscode` must never be higher. `vscode-languageclient` 10 sets the floor at `1.91`.
- `extensionDependencies` lists `vscode.git`, which gives `instant-git-refresh.ts` the Git API.
- `vscode:prepublish` runs `pnpm run build`, so `vsce` always packages a fresh `dist/`. The `package` script runs the root `pnpm run ci` first.
- Nothing tags `version` automatically. See the root `.agents/references/release.md`.
