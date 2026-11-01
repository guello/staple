---
description: 'Use when editing Ghostty Syntax: the settings write policy, the color provider, and the hover reference parser.'
paths:
  - 'src/features/ghostty-syntax/**'
  - 'languages/ghostty/**'
  - 'scripts/generate-ghostty-reference.mts'
---

# Ghostty Syntax

Each guard below fixes a defect that occurred. Do not remove a guard without a reproduction of its case.

## Settings write

- `syncAssociations()` writes to the global `files.associations` of the user. It is the only code in the extension that changes settings of another owner.
- Add a glob only when its key is absent. Remove a glob only when its value is still `ghostty`.
- A user who points a glob at another language keeps that value. When `autoAssociations` is off, revert only the globs that the extension added.
- Read the global value through `inspect()`, never the merged `get()`. A write of the merged value copies workspace keys into user settings.
- Swallow the `files.update` rejection. Some remote and restricted profiles cannot write the setting, and the rest of activation must continue.

## Colors

- Skip a line whose first non-blank character is `#`, so that a commented-out theme line gets no color swatch.
- Run the hex pattern on the rest of each line, because `palette = 0=#1d1f21` has the color in the middle.
- Write presentations as `#rrggbb`. Use `#rrggbbaa` only when alpha is below 1, or each color that a user picks gets rewritten.

## Hover reference

- The hover reads `languages/ghostty/reference/`, the raw output of `ghostty +show-config --default --docs` and `ghostty +list-actions --docs`.
- Never edit the reference files by hand. Write them with `pnpm --filter staple run generate:ghostty`.
- The generator only replaces dashes and trims trailing whitespace.
- The files ship as text and are parsed on the first hover. A diff after a Ghostty upgrade then shows only Ghostty doc changes.
- `parseReference()` gives a key without its own comment the docs of the key above it. Ghostty documents `font-family-bold` and its siblings on `font-family`.
- A blank line clears pending comment lines. Ghostty prints docs without a key line for some options (`link`, `quick-terminal-size`), and they leak otherwise.
- Find a keybind action after the first `=` that has no `+` or `=` after it. Then `ctrl+==increase_font_size` resolves to the action, not to the key.
- Cache a failed read of the reference as no hover. A missing file must not raise an error on each mouse move.
