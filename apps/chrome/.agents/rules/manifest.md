---
description: 'Use when editing manifest.json: the shortcut budget, the command rules of Chrome, the permission policy, and the paired fields.'
paths:
  - 'manifest.json'
---

# Manifest

`apps/chrome/manifest.json` is the source of truth. `scripts/build.mts` copies it into `dist/` without changes.

## Shortcuts

- Chrome accepts any number of commands, but at most four `suggested_key` defaults. All four are in use.
- When a new command needs a default, remove one from another command, or ship the new command unbound.
- Keep the command ids in this order: left, right, next window, new window, previous tab. `chrome://extensions/shortcuts` sorts them by id.

| Command                    | Default               | macOS                 | Why                                            |
| -------------------------- | --------------------- | --------------------- | ---------------------------------------------- |
| `tab-shift-left`           | `Ctrl+Shift+PageUp`   | `MacCtrl+Shift+Left`  | `Ctrl+Shift+Left` selects words outside macOS. |
| `tab-shift-right`          | `Ctrl+Shift+PageDown` | `MacCtrl+Shift+Right` | Same.                                          |
| `tab-shift-to-next-window` | `Alt+Shift+M`         | `MacCtrl+Shift+Down`  | `Ctrl+Shift+M` is the Chrome profile switcher. |
| `tab-shift-undock`         | none                  | `MacCtrl+Shift+Up`    | Completes the arrow group on macOS only.       |
| `tab-switch`               | none                  | none                  | Unbound. The user selects the key.             |

### Chrome checks

Chrome rejects the manifest or drops the binding when a rule below fails:

- A shortcut must include `Ctrl` or `Alt`. `Ctrl+Alt` combinations are not valid.
- On macOS, `Ctrl` maps to Command. Use `MacCtrl` for Control, and only in the `mac` key.
- A default that collides with a Chrome shortcut never fires. For example, `Ctrl+Shift+A` is the Chrome tab search.
- Before you add a default, check it against the Chrome shortcut list. When it collides, leave the command unbound.
- `_execute_action` opens the popup and never fires `onCommand`, so the popup starts its work on load.
- Every `commands` key must exist in `COMMAND_IDS` in `src/lib/commands.ts`. No build step checks this.
- Every id in `COMMAND_IDS` needs a `PRESENTATION` entry in `src/action/action.ts`.

## Permissions

- `storage` is the only permission. Justify a new permission in the commit that adds it.
- The current calls need no permission: `chrome.tabs.query`, `move`, `update`, `highlight`, `chrome.windows.*` and the commands API.
- Never read `tab.url`, `tab.title` or `tab.favIconUrl` without an ask. They need the `tabs` permission, and the install then warns about browsing history.
- A tab list needs `tabs` plus `favicon`. Put that permission change in its own commit.

## Fields that pair with something else

- `minimum_chrome_version` is `121`, and `scripts/build.mts` targets `chrome121`. Change both together.
- Before you change them, check the `@since` of every Chrome API in use. Version 121 added `tab.lastAccessed`, which Tab Switch needs.
- Keep `version` equal to `version` in `package.json`. The store reads the manifest, and `apps/chrome/scripts/package.mts` names the zip from `package.json`.
- `background.type` is `module`, to match the esbuild `format: 'esm'` output.
- Paths in `action`, `options_ui` and `icons` resolve inside `dist/`, so they follow the `outbase: 'src'` layout. Only `media` is the same in both.
