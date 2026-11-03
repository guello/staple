# TOML

The process model is in `.agents/references/architecture.md`. Do not remove a guard below without a reproduction of its case.

- Keep `index.ts` a serialized state machine, not a pair of start and stop calls.
- `requestSynchronization()` sets a dirty flag and reuses the in-flight promise. `synchronize()` loops while the flag is set.
- Open, close and configuration events arrive faster than the server starts, and a second client leaks a process.
- Load the client with a runtime `import()` of the built `client.js` URL. A static import puts `vscode-languageclient` into `extension.js` for all users.
- Keep `stopToml` at module scope, so that `deactivate()` awaits the same state machine. VS Code kills the host when `deactivate()` returns too early.
- `server.ts` calls `process.send?.()` and `process.disconnect?.()`. Both exist only with an IPC channel, and the server can also run without one.
- Keep semantic tokens off in the middleware and in the Taplo configuration. The TextMate grammar already colors TOML, and the two disagree.
- Keep Taplo config file discovery off and the catalogs empty. Schemas come only from `$schema` or `#:schema` in the document, on all machines.
