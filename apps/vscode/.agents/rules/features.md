# Feature invariants

Each guard below fixes a defect that occurred, several in the extensions that these features replace. Do not remove a guard without a reproduction of its case.

## Feature contract

- Export `activate<Name>(context: vscode.ExtensionContext)` and call it one time from `src/extension.ts`.
- Push every disposable to `context.subscriptions`.
- Keep the settings under `staple.<feature>`, with an `onDidChangeConfiguration` listener filtered by `affectsConfiguration`.
- Return early when the `enabled` setting of the feature is off.
- Read settings at the point of use, never at activation.
- Pass the scope of a resource or language setting: `getConfiguration(SECTION, uri)`, or `{ uri, languageId }` in `toggle-quotes.ts`.
- Without the scope, VS Code ignores workspace and language overrides.
- Put new logic in a pure sibling module with a test. `scripts/test.mts` replaces `vscode` with an empty object, so a module that imports it has no unit tests.

## Feature rules

- Ghostty Syntax: `.agents/rules/ghostty.md`.
- TOML: `.agents/rules/toml.md`.
- Markdown: `.agents/rules/markdown-preview.md`.

## Git Instant Refresh

`vscode.git` refreshes after external changes through a fixed 1 s debounce, an idle wait and a 5 s throttle. This feature makes the refresh immediate.

- Use two watchers for each repository: the metadata glob and `.git/refs/**`. A `.git/**` watcher floods on object writes during a fetch.
- The metadata glob is `HEAD`, `ORIG_HEAD`, `FETCH_HEAD`, `MERGE_HEAD`, `CHERRY_PICK_HEAD`, `REBASE_HEAD`, `index` and `packed-refs`.
- Keep the in-flight flag and the pending flag in `refresh()`. `repository.status()` can outlast the debounce, and a second call drops the later change.
- On the pending path, schedule a new refresh. Do not await the current one.
- Swallow `repository.status()` rejections. A repository in a rebase throws, and an unhandled rejection shows an error toast on each keystroke.
- Key the tracker map by `rootUri.toString()`, and build it again on each configuration change. A submodule can have a different `delay`.
- Return early when `vscode.git` is absent, although `extensionDependencies` declares it.

## Optimize Images

- Start the app through `execFile`, never `exec`, a shell or a command string. Paths are argv entries, so names with `&`, spaces or quotes are safe.
- Keep `staple.optimizeImages.app` at `machine` scope. A workspace value that names an executable runs code on folder open.
- Keep the feature hidden until `app` is set. All menu `when` clauses and palette entries check `config.staple.optimizeImages.app`.
- Track visited `realpath` values in the recursive walk. A symlink loop otherwise recurses without end.
- Open all images of a folder run in one launch, and ask for confirmation above `confirmThreshold`. Most optimizers write in place.

## Toggle Quotes

- `isEscaped()` counts the preceding backslashes, and an odd count means escaped. A plain `indexOf` scan splits `"a \" b"` into two strings.
- Symmetric pairs match greedily in order (`0-1`, `2-3`). Asymmetric pairs match the nearest opener at or before the cursor and the first closer after it.
- When several pairs enclose the cursor, the innermost match wins.
- `convertBody()` unescapes the old delimiter and escapes the new one, for single-character symmetric pairs only. Other pairs corrupt the body.
- The cycle is `(index + 1) % pairs.length` over `chars`, so the order of `chars` is the cycle order. With fewer than two pairs, the command does nothing.

## Sort Objects By Key

- Compare numbers through a parsed `{ negative, digits, magnitude, zero }` record built with `bigint`. `Number` loses precision past `Number.MAX_SAFE_INTEGER`.
- Rewrite the original text spans with the raw source of each object, so that comments and formats stay. Never use `JSON.parse` then `JSON.stringify`.
- Keep objects without the selected key last, in their original order. This keeps the sort stable and reversible.
- On invalid structure, throw a message that the command shows, and leave the document unchanged.
