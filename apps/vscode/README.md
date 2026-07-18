<div align="center">
  <img src="icon.png" style="width: 5.5rem" />

  # VS Code Tools
</div>

Essential Visual Studio Code utilities packaged as a single lightweight and performant extension.

## Features

### Git Instant Refresh

Refreshes the built-in Git view (Source Control changes list) as soon as a repository changes outside VS Code: GitLens actions, terminal git commands, external tools. The built-in `vscode.git` extension reacts to external `.git` changes through a hardcoded slow path (1s debounce, wait for idle, then a 5s trailing throttle) with no setting to tune it. This feature watches `.git` metadata (HEAD, index, refs, merge state) in every open repository and calls the Git API's `repository.status()` directly.

| Setting                                 | Default | Description                                  |
| --------------------------------------- | ------- | -------------------------------------------- |
| `vscodeTools.gitInstantRefresh.enabled` | `true`  | Enable the feature.                          |
| `vscodeTools.gitInstantRefresh.delay`   | `200`   | Debounce in milliseconds before the refresh. |

### Toggle Quotes

Cycles the quotes around the cursor with `cmd+'` (`ctrl+'` on Windows and Linux), replacing the [vscode-toggle-quotes](https://marketplace.visualstudio.com/items?itemName=BriteSnow.vscode-toggle-quotes) extension. Supports multiple cursors and escapes or unescapes inner quotes when cycling.

| Setting                            | Default       | Description                                                                                                                                                            |
| ---------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vscodeTools.toggleQuotes.enabled` | `true`        | Enable the command.                                                                                                                                                    |
| `vscodeTools.toggleQuotes.chars`   | `["\"", "'"]` | Characters to cycle. Entries are a character or a [begin, end] pair. Language overridable; backtick is added by default for JavaScript, TypeScript, Vue, and Markdown. |

## Development

```sh
pnpm install
pnpm run deploy
```

`pnpm run deploy` typechecks with tsc, bundles `src/` into `extension.js` with esbuild, packages the vsix, and installs it into VS Code. Reload the VS Code window after installing. Use `pnpm run check`, `pnpm run build`, or `pnpm run package` for the individual steps.
