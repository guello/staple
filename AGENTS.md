# Staple

Staple is a set of small developer tools in one repository. Each tool ships on its own, with its own version, changelog, tag and release artifact.

## Layout

- `apps/<name>/` holds one shipped tool, with its own `package.json`, `AGENTS.md` and `README.md`.
- `packages/<name>/` holds shared code. Add a package only when a second app needs the code.

## Conventions

- Commits follow Conventional Commits: `type(scope): description`.
- For a change inside one app, the scope is the name of the app directory, for example `feat(chrome): add tab search`.
- Commits are signed.
- Prefer platform APIs and small hand-written scripts to frameworks. A new dependency needs a reason that the platform cannot cover.
