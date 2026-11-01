---
description: 'Use when editing a Chrome feature in src/features: the service worker rules, the guards in each feature, and the manual checks.'
paths:
  - 'src/features/**'
---

# Feature invariants

Each feature replaces a popular extension, and each guard below fixes a defect from its public issues.

- Do not remove a guard without a reproduction of the case that it covers.
- Put new logic in the pure sibling module (`mru.ts`, `moves.ts`) with a colocated test. `index.ts` holds the Chrome API calls and has no unit tests.

## Service worker rules

- Register every listener synchronously at the top level of `registerX()`. A listener added in a promise callback is lost when Chrome restarts the worker.
- Keep no state in memory. Chrome stops the worker after about 30 seconds idle.
- Put state that must outlive an event in `chrome.storage.session`. Compute the rest again from live `chrome.tabs` and `chrome.windows` queries.
- Send every read, modify and write of stored state through `serialize()` in `src/features/tab-switch/index.ts`. Tab events arrive concurrently.
- Use `chrome.storage.session` for state and `chrome.storage.sync` for settings. Tab ids never reach disk, so incognito ids stay off it.
- In every handler, read the `enabled` setting first and return early when it is off. A shortcut reaches the handler even when the popup hides it.

## Tab Switch

### Storage

- Keep the history in `chrome.storage.session`, never `local`. The original wrote tab ids, incognito ones included, to disk.
- Seed the history from `tab.lastAccessed` through `seedState()` on `runtime.onInstalled` and `runtime.onStartup`. Session storage starts empty.
- Keep activations recorded before the seed lands ahead of the seeded entries.
- Keep `serialize()`. The original polled a boolean mutex every 50 ms and still lost writes.

### History

- When a candidate tab is gone, walk deeper into the history instead of a silent failure.
- Build the history from `tabs.onActivated`, `windows.onFocusChanged`, `tabs.onAttached`, `tabs.onRemoved` and `windows.onRemoved`.
- In `windows.onFocusChanged`, accept normal windows only and ignore `WINDOW_ID_NONE`.
- In `tabs.onAttached`, remap the entry instead of a drop, so that a dragged tab keeps its place.
- Cap each window at `MAX_ENTRIES_PER_WINDOW`, and prune the entries of a closed window.
- Keep `tabSwitch.scope` at `window` by default. `global` also focuses the target window.

### Tab Switch acceptance

Check these by hand, with the extension loaded:

1. Repeated presses toggle between tabs A and B.
2. Two windows keep separate histories.
3. A worker stop from `chrome://serviceworker-internals` keeps the history.
4. When the target tab is closed, the shortcut goes to the next live tab.

## Tab Shift

### Moves

- Move the whole highlighted selection and keep its order. `planShift()` sorts left moves left to right and right moves right to left.
- Clamp moves at the strip edges. Wrap only when `tabShift.wrap` is on, and then move the whole block to the far end.
- For next window and undock, use `type: 'normal'` windows only. Never cross the incognito boundary, because Chrome rejects that `tabs.move`.
- When next window finds no other eligible window, create one if `tabShift.createWindow` is on.
- Make undock a no-op when the selection is every tab in the window, because the move leaves an empty window.

### Moves to another window

- Pin the tabs again after a move to another window. Chrome drops the pinned state.
- After a selection leaves a window, let `restoreSourceActiveTab()` choose the next active tab, not Chrome.
- Let `reselect()` restore the highlight in the destination, so that a multi-tab selection stays selected.
- Keep the native `tabs.move` group behavior: a move inside a group stays in it, past the edge ejects, to another window ungroups. Assert it in tests.

### Tab Shift acceptance

1. Move one tab and a multi-tab selection in both directions.
2. Undock a selection.
3. Cycle next window across three normal windows, with an app window that it skips.
4. In a profile with one window, next window creates a second window.
