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
npm test                     # compile then run tests
```

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
