# Markdown preview

The preview has three parts that must agree:

- The markdown-it plugin in `src/features/markdown/`.
- The generated stylesheets in `dist/features/markdown/`.
- The hand-written stylesheets in `media/markdown/`.

`contributes.markdown.previewStyles` in `package.json` lists all five stylesheets in load order, the generated ones first.

## Generated stylesheets

- `scripts/generate-github-markdown.mts` writes `dist/features/markdown/markdown.css` and `themes.css` on each build, with a do-not-edit header.
- Never edit the generated output. Change the generator, or put hand-written rules in `media/markdown/`.
- The generator calls `generate-github-markdown-css`, which reads github.com and the public Markdown API. A cold cache needs the network.
- The result stays in `node_modules/.cache` for one day. When a build fails here offline, the cache expired, not the code.
- The generator changes each `rem` to `px` at 16px. The VS Code preview root is 14px, so `rem` values make the GitHub stylesheet smaller.
- The generator drops rules with `:is()` in the selector. The upstream package emits them empty, and no browser matches them.
- `splitVariables()` and `withoutDeadRules()` throw when the upstream stylesheet changes shape. Fix the generator, not a downstream override.

## Theme selection in CSS

In a webview, `prefers-color-scheme` follows the OS, not the editor theme. So the generator emits one selector for each mode:

- `mode: light` and `mode: dark` set a theme directly.
- `mode: auto` uses the `.vscode-light`, `.vscode-dark` and `.vscode-high-contrast` classes on the preview body.
- The `auto` dark selector excludes `.vscode-high-contrast-light`, which also has `.vscode-high-contrast`.
- `mode: system` uses `@media (prefers-color-scheme: ...)`.
- `markdown.css` is inside `@container style(--markdown-theme: github)`. `themes.css` sets that property to `github` or `default` on the wrapper.
- The `default` theme then falls through to the VS Code preview styles without a second stylesheet.
- A rule added to `markdown.css` applies only to the GitHub theme. Put a rule that must also apply under `default` in `media/markdown/`.

## The markdown-it contract

- VS Code owns the markdown-it instance and gives it to `extendMarkdownIt` one time for each preview engine. Nothing can register again later.
- `src/features/markdown/markdown-it.ts` declares the subset of types in use. Adding `@types/markdown-it` is a dependency that needs a reason.
- The task-list rule and the render wrapper read settings in a closure on each render, so a change applies on the next `markdown.preview.refresh`.

## Task lists

- The core rule matches only `list_item_open`, `paragraph_open`, `inline` in sequence, with a leading `[x]` text token.
- The character after the marker must be whitespace or the end of content. A looser check turns `[note]` prose into a checkbox.
- `resolveStates()` keeps single characters that map to a known state and drops all others. A bad user setting gives fewer checkboxes, not a renderer error.
- The checkbox is `html_inline` tokens around the label in `.task-list-item-label`, with `data-task-state` on the input and the list item.
- `media/markdown/task-lists.css` styles from those attributes. When you change an attribute name, change both files.
- The input is always `disabled`. The preview is not an editor, and a click does not write back.
- When another extension renders task lists, it parses `[ ]` first and its markup wins. The stylesheet also uses the GitHub class names, so it still applies.
