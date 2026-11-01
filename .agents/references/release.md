# Release

How a version of an app leaves this repository. Each app has its own version, tag and artifact.

Before you assume that a version is out, check `git tag` and `gh release list`.

## Versions and tags

| App      | Version in                      | Tag                 | Artifact in the app directory |
| -------- | ------------------------------- | ------------------- | ----------------------------- |
| `chrome` | `package.json`, `manifest.json` | `staple-chrome@<v>` | `staple-chrome-<v>.zip`       |
| `vscode` | `package.json`                  | `staple-vscode@<v>` | `staple-vscode-<v>.vsix`      |

The two Chrome files must always hold the same version.

Git ignores both artifacts. `apps/chrome/scripts/package.mts` names the zip from `package.json`, but the Chrome Web Store reads `manifest.json`.

## Cutting a version

1. Bump the version of the app. For Chrome, bump both files.
2. Run `pnpm --filter staple-chrome run package` or `pnpm --filter staple run package`. Each runs the root `pnpm run ci`, then builds and writes the artifact.
3. For VS Code, read the file list that `vsce` prints. `.vscodeignore` is an allowlist, and the gates cannot see a missing directory.
4. Test the built extension by hand. The gates never touch the Chrome or VS Code API.
5. Commit as `chore(release): staple-<app>@<version>` and add a signed tag with the same name.
6. Push the commit and the tag, then create the GitHub release with the artifact attached.

`vsce package --no-dependencies` is required. Without it, `vsce` follows symlinks into the pnpm store, and the package gets too large or fails.

The two runtime dependencies are already in the esbuild bundle.

The `package` script passes `--baseContentUrl` and `--baseImagesUrl` with the `apps/vscode` path. `vsce` ignores `repository.directory`.

Without the two flags, every relative link and image in the Marketplace README points at the repository root and breaks.

Commits and tags are signed through the `ssh-keygen` signer. Never disable signing.

## Chrome Web Store

The first submission is manual: the API cannot create an item.

1. Sign in to the Developer Dashboard with the account that will own the listing, and pay the one-time registration fee for a first submission.
2. Create a new item and upload `staple-chrome-<version>.zip`.
3. Fill the store listing: description, category, language, at least one 1280 by 800 screenshot, and the 128 px icon from `apps/chrome/media/`.
4. Complete the privacy tab. Justify only `storage`, which keeps the settings and the tab history, and declare that the extension collects nothing.
5. Submit for review. A review takes days, and a rejection usually names the permission or the listing field at fault.

## VS Code Marketplace

1. Create the `guello` publisher at `marketplace.visualstudio.com/manage`. It must match the `publisher` field in `apps/vscode/package.json`.
2. Publish a packaged version with `pnpm --filter staple exec vsce publish --no-dependencies --packagePath staple-vscode-<version>.vsix`.
3. The listing renders `apps/vscode/README.md` and the icon from `package.json`. Push a new image before you publish, or it shows as broken.
4. `THIRD_PARTY_NOTICES.md` ships in the vsix. It covers the vendored Ghostty grammar, the generated Ghostty reference and the Taplo derivation.
5. Give each new vendored file an entry in `THIRD_PARTY_NOTICES.md` in the same commit.

Open VSX is a separate registry with its own namespace, token and `ovsx publish` step.
