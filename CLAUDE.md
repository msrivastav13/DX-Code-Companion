# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

DX-Code-Companion is a VS Code extension ("CCDX") that supplements the official Salesforce Extension Pack. It provides fast deploy/save of Apex, Visualforce, Aura, and LWC files to Salesforce orgs without source tracking. It also retrieves metadata from packages/changesets in both DX and traditional formats.

The extension depends on `mo-dx-plugin` (a Salesforce CLI plugin) — most commands delegate to `sfdx` CLI calls sent to VS Code's integrated terminal.

## Build and Development Commands

```bash
npm install                  # install dependencies (runs postinstall to set up vscode typings)
npm run compile              # compile TypeScript to out/
npm run watch                # compile in watch mode (used during development)
npm test                     # compile, then run the extension-host suites in real VS Code (bash + zsh terminals)
npm run test:ui              # Playwright UI smoke tests against the packaged VSIX (incl. Workspace Trust)
CCDX_TEST_ORG=<alias> npm run test:org   # opt-in: replay generated commands with the real CLI against a disposable org
```

### Tests

- `src/test/runTest.ts` downloads VS Code via `@vscode/test-electron` and runs `src/test/integration/*.test.ts` (or `src/test/org/`) inside its extension host, once per shell in `CCDX_TEST_SHELLS`.
- `src/test/environment.ts` builds each sandbox: a temp copy of `test-fixtures/project` (path contains spaces, `&` and `'` on macOS/Linux), a private profile, and a terminal profile whose PATH puts `test-fixtures/bin/sf` first. That shim records the argv the real shell delivered, so tests assert on what a terminal actually parsed (`sfCalls()` in `src/test/helpers.ts`).
- Injection payloads in tests write `ccdx-canary` into the workspace if they ever execute; helpers fail the test when it appears.
- `e2e/` holds the Playwright suite (`_electron.launch` on the downloaded VS Code; installs the VSIX built by `vsce package`). Failure traces land in `test-results/`; open with `npx playwright show-trace`.

### Releasing

1. Bump `version` in `package.json` (and `package-lock.json`) and add a `### <version>` section at the top of `CHANGELOG.md`. That section becomes the GitHub release notes.
2. Merge to `master`, then tag it with the bare version and push: `git tag -a 0.5.2 -m 0.5.2 && git push origin 0.5.2`.
3. `.github/workflows/release.yml` runs the full test matrix, checks the tag matches `package.json`, runs `./publish.sh` with the `VSCE_PAT` and `OPEN_VSX_PAT` repository secrets, and creates the GitHub release with both VSIX files. The Marketplace publisher is `MohithShrivastava`; on Open VSX it is `msrivastav13` (the script swaps it while packaging).

`./publish.sh --dry-run` builds both VSIX files locally without publishing.

To debug the extension: press F5 in VS Code (uses the "Extension" launch config), which compiles via `npm: watch` and opens an Extension Development Host window.

## Architecture

**Entry point:** `src/extension.ts` — registers all `CCDX:` commands and the `onDidSaveTextDocument` listener that triggers auto-deploy.

**Core flow:** File save → `DeploySource.deploy()` → `CommandService.generateCommand()` builds an `sfdx deploy:*` command string → command is sent to VS Code terminal via `Terminal.sendText()`. The extension does NOT use the Salesforce CLI programmatically; it shells out through the terminal.

**Key services (all in `src/services/`):**

- `deploy.ts` — `DeploySource` handles save-to-server, refresh-from-server, compare-with-server, and conflict management. Central orchestrator for deploy operations.
- `commandBuilder.ts` — `CommandService` constructs `sfdx deploy:*` CLI commands based on file path and metadata type.
- `findMetadataType.ts` — `Metadata` resolves a file path to its Salesforce metadata type (`ApexClass`, `AuraDefinition`, `LightningComponent`, etc.) and the corresponding CLI sub-command. Also maps Aura file extensions to `DefType` values.
- `config.ts` — `Config` reads SFDX auth/config files via `@salesforce/core` to get the default username and connection.
- `sfdcUtils.ts` — `SalesforceUtil` queries the Tooling API for server-side file content (used for conflict detection and refresh) and package lists.
- `retrieve.ts` — `RetrieveSource` lists packages via Tooling API and delegates retrieval to `sfdx retrieve:*` terminal commands.
- `changeset.ts` — `Changeset` manages changeset-based development: creates directory structure, retrieves source, manages `orgs.json` for multi-org deployment.
- `switchOrg.ts` — switches the default SFDX org via `force:config:set`.
- `vscodeCore.ts` — terminal management (creates/reuses "DX Companion" terminal) and status bar.
- `vscodeUI.ts` — thin wrappers around VS Code input box and quick pick.

**Content provider:** `src/providers/ccprovider.ts` — singleton `TextDocumentContentProvider` that serves server-side file content for the diff view (registered under the `codecompanion://` URI scheme).

**Types:** `src/typings/ccdxTypings.ts` — interfaces for `QueryResult`, `MetadataType`, `Query`, and `ServerResult`.

## Extension Settings

Three user-configurable settings (prefix `dx-code-companion`):
- `autosave.enabled` (default: `true`) — auto-deploy on file save
- `manageconflict.enabled` (default: `false`) — compare with server before save
- `staticresourcefolder.resourceBundleFoldername` (default: `"staticresources"`) — folder name for static resource bundles

## Supported File Types for Deploy

Apex (`.cls`, `.trigger`), Visualforce (`.page`, `.component`), Aura (`.cmp`, `.app`, `.evt`, `.css`, `.js`, `.design`, `.svg`, `.tokens`, `.intf`, `.auradoc`), LWC (`.js`, `.css`, `.html` inside `lwc/` parent), and static resources (files inside the configured resource bundle folder).

## Linting

Uses TSLint (`tslint.json`) with strict settings: semicolons always, triple-equals, curly braces required, no unused expressions.
