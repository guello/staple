# Chrome app architecture

Paths are relative to `apps/chrome`.

## Service worker

- `src/background.ts` is the service worker. It calls one `registerX()` for each feature.
- It routes `chrome.commands.onCommand` and the `run-command` message through the handler registry in `src/lib/commands.ts`.
- Extension pages cannot call feature code, so the popup sends a message to the worker through `chrome.runtime.sendMessage`.

## Features

- A feature is a folder under `src/features/`.
- Its `index.ts` exports `register<Name>(): void` and owns every Chrome API call.
- Sibling modules hold the decisions as pure functions (`mru.ts`, `moves.ts`), each with a colocated `*.test.ts`.
- Only the pure modules have unit tests, because the test harness replaces `chrome` with an empty object.
- The service worker rules are in `.agents/rules/features.md`.

## Shared modules

| Module                | Holds                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| `src/lib/commands.ts` | The command id union and the registry.                                                          |
| `src/lib/settings.ts` | The typed schema on `chrome.storage.sync`.                                                      |
| `src/lib/features.ts` | The display metadata of each feature.                                                           |
| `src/lib/messages.ts` | The single message type.                                                                        |
| `src/ui/`             | The tokens and DOM helpers that `src/action/` (popup) and `src/options/` (settings page) share. |
