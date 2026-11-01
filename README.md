# Staple

Essential utilities packaged as a single fast, performant, and scalable extensions.

| Tool                              | What it does                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------- |
| [Staple for Chrome](apps/chrome)  | Keyboard tab utilities: switch to last tab, move tabs around.                     |
| [Staple for VS Code](apps/vscode) | Editor utilities: Git refresh, quote toggle, TOML support, and markdown previews. |

Each tool has its own README with install steps, settings and shortcuts.

## Development

The repository is a pnpm workspace. Node and pnpm are pinned through `.node-version` and the `packageManager` field.

- `pnpm run ci` runs the format, lint, dead-code and type checks for every package, then runs the test suite.
- `pnpm build` builds all tool concurrently.

The README of each tool covers its build and packaging steps.

Commits follow [Conventional Commits](https://www.conventionalcommits.org) with the tool directory as the scope: `feat(chrome): add tab search`.

## License

[MIT](LICENSE)
