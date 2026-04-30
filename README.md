# SalesforceDX Code Companion


VS Code extension for deploying Apex, Visualforce, Aura, and LWC files to Salesforce orgs without source tracking. Also retrieves metadata from packages and changesets. Not an official Salesforce product.

Depends on [Salesforce CLI (`sf`)](https://developer.salesforce.com/tools/salesforcecli) and [mo-dx-plugin](https://github.com/msrivastav13/mo-dx-plugin) (auto-installed on activation).

## Setup

1. Install [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli)
2. Authorize your org: `sf org login web`
3. Open a project with `sfdx-project.json` in the root
4. The extension activates automatically (rocket icon in the status bar)

`mo-dx-plugin` is installed automatically on first activation. Because the plugin is unsigned, the Salesforce CLI will prompt you to confirm the installation in the VS Code terminal — type `y` to proceed. To update manually: `sf plugins install mo-dx-plugin`

## Commands

All commands are available via the command palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) under the `CCDX:` prefix.

| Command | What it does |
|---------|-------------|
| `CCDX: Save To Salesforce` | Deploy current file to the default org |
| `CCDX: Refresh From Server` | Pull server version of the current file |
| `CCDX: Compare With Server` | Diff local vs. server |
| `CCDX: Retrieve DX Source From Package` | Retrieve package metadata in DX source format |
| `CCDX: Retrieve Source From Package` | Retrieve package metadata in traditional metadata format |
| `CCDX: Retrieve Source From Changeset` | Retrieve changeset source from a sandbox |
| `CCDX: Deploy Source To Salesforce` | Deploy an `src` folder of classic metadata |
| `CCDX: Deploy Static Resource` | Deploy a folder as a static resource bundle |
| `CCDX: Switch Org` | Change the default target org |
| `CCDX: Open Default Org` | Open the default org in a browser |
| `CCDX: Add Orgs For Changeset Deployment` | Add target orgs to a changeset's `orgs.json` |

**Keyboard shortcut:** `Cmd+Shift+C` / `Ctrl+Shift+C` saves the current file to Salesforce.

## Supported File Types

Apex (`.cls`, `.trigger`), Visualforce (`.page`, `.component`), Aura (`.cmp`, `.app`, `.evt`, `.css`, `.js`, `.design`, `.svg`, `.tokens`, `.intf`, `.auradoc`), LWC (`.js`, `.css`, `.html` inside `lwc/`), and static resources.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `dx-code-companion.autosave.enabled` | `true` | Deploy on file save |
| `dx-code-companion.manageconflict.enabled` | `false` | Compare with server before deploying |
| `dx-code-companion.staticresourcefolder.resourceBundleFoldername` | `"staticresources"` | Static resource bundle folder name |

## Conflict Management

When `manageconflict.enabled` is `true`, the extension compares your local file with the server copy before deploying. If they differ, a diff editor opens with options to overwrite or accept the server version.

## Output

Deploy results (success/failure) appear in the VS Code terminal. Keep the terminal panel open to see errors.

## Issues

[GitHub Issues](https://github.com/msrivastav13/DX-Code-Companion/issues)

## Links

- [Mo DX Plugin](https://github.com/msrivastav13/mo-dx-plugin)
- [Changelog](CHANGELOG.md)
- [Salesforce Extension Pack](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode) (recommended companion)
