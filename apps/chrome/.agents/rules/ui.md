# Chrome-native UI

The popup and the options page must look like a part of Chrome, not like a web page.

- When you need a new value, read it from Chromium: `tab_search/`, `mwb_shared_vars.css`, `cr_shared_vars.css` and the `chrome://settings` cards.
- Write the CSS by hand. The Chromium `cr-*` elements are not on npm and need `chrome://` schemes, and `@material/web` is in maintenance mode.

## Tokens

- Put every color in `src/ui/chrome.css` as a `--st-*` custom property, with its dark value under `@media (prefers-color-scheme: dark)`.
- Never write a color in `action.css` or `options.css`. Refer to a `--st-*` token.
- Never add a second palette.
- When a surface needs them, add the GM3 `primary-container` (`#d3e3fd` light, `#0842a0` dark) and `error` (`#b3261e` light, `#f2b8b5` dark).

## Metrics

- The popup width is `320px` on `html, body`, the same as the Chrome tab search bubble. Chrome caps a popup at 800 by 600 CSS pixels.
- Keep fixed row heights (`--st-row-height`, 48px). A row that grows while an icon loads moves the whole list.
- The row icon container is 40 by 40 with `--st-radius` (8px) and a 16px inline-end margin. The 16px glyph inherits `currentcolor`.
- Text buttons are 36px tall and pill shaped. Section headers are 48px tall at 11px.
- The focus ring is `2px solid var(--st-primary)` with a 2px offset on `:focus-visible`, for all elements.
- Show disabled content with `.st-disabled`: `--st-disabled-opacity` (0.38) plus `pointer-events: none`.
- Toggles follow `cr-toggle`: a 34 by 14 track, a 16px thumb, an 80 ms linear transition, and a checked track at 50 percent primary.

## Typography

- The font stack is `system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`. Chrome WebUI renders at 75 percent of 16px, so the base is 12px.
- Row titles are 13px. Secondary text and section headers are 11px, and headers use weight 500.

## Dark mode and instant paint

- Give every HTML surface `<meta name="color-scheme" content="light dark">` and `color-scheme: light dark` on `:root`.
- Set the `html` background for both schemes in an inline `<style>` in `<head>`. Without it, the canvas flashes white. `src/action/action.html` is the example.
- The surfaces follow the OS color scheme only. A dark Chrome theme on a light OS gives a light popup, and no API can change it.
- Keep one small bundle and local CSS: no network request, no web font, no remote image.
- When a surface needs favicons, use `chrome-extension://<id>/_favicon/?pageUrl=<url>&size=16`. It needs the `favicon` permission.

## DOM

- Build nodes with `element()` and `icon()` from `src/ui/dom.ts`. They set `textContent`.
- Never use `innerHTML`. Tab titles and URLs come from web pages, so `innerHTML` on them is an injection.
- Put icons as inline SVG path data in the module that renders them. Do not add an icon font or a sprite.
- The popup sends `{ type: 'run-command', command }` to the worker and closes on success. It never imports feature code.

## Tab list anatomy

When you build a searchable tab list, copy the Chromium tab search layout:

- Search field: 60px tall, `0 20px` padding, a 16px search icon with a 12px gap, a secondary placeholder color and `autofocus`.
- Row: 48px, the favicon in the 40 by 40 container, and a 13px title on one line with an ellipsis.
- Domain line: 12px in the secondary color, with `direction: rtl` so that it elides from the front against spoofing. The stack gap is 3px.
- Show the close button on `:hover` and on the selected row.
- Section headers ("Open tabs", "Recently closed") stick to the top above a 1px separator. The scrollbar is 4px.
- The selected row is one step darker than hover: `rgba(32, 33, 36, .14)` light and `rgb(68, 69, 71)` dark.
