'use strict';

// Runs against a real org (CCDX_TEST_ORG, exposed to the extension as SF_TARGET_ORG). The extension's
// command is captured from the terminal as usual, then replayed with the real Salesforce CLI and
// mo-dx-plugin, and the result is checked through the Tooling API. Creates and deletes one Apex class.

import * as assert from 'assert';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { Config } from '../../services/config';
import { activateExtension, editAndSave, nextSfCall, openInEditor, waitFor, workspace, workspacePath, writeWorkspaceFile } from '../helpers';

const org = process.env.SF_TARGET_ORG as string;

function realSf(args: string[]): cp.SpawnSyncReturns<string> {
    // No shell: argv goes to the CLI exactly as the terminal delivered it to the shim
    return cp.spawnSync('sf', args, { cwd: workspace, encoding: 'utf8', shell: process.platform === 'win32' });
}

suite('Real org', function () {
    this.timeout(180000);

    const className = 'CcdxE2e' + Date.now();
    const classPath = `force-app/main/default/classes/${className}.cls`;
    let restoreErrors: () => void;

    suiteSetup(async () => {
        restoreErrors = await activateExtension();
        writeWorkspaceFile(classPath,
            `public with sharing class ${className} {\n    public static String marker() {\n        return '${className}';\n    }\n}\n`);
        writeWorkspaceFile(classPath + '-meta.xml',
            '<?xml version="1.0" encoding="UTF-8"?>\n<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">\n' +
            '    <apiVersion>62.0</apiVersion>\n    <status>Active</status>\n</ApexClass>\n');
    });

    suiteTeardown(() => {
        restoreErrors();
        const cleanup = realSf(['project', 'delete', 'source', '--metadata', `ApexClass:${className}`, '--target-org', org, '--no-prompt']);
        if (cleanup.status !== 0) {
            console.warn(`Could not delete ApexClass ${className} from ${org}; remove it manually.\n${cleanup.stdout}${cleanup.stderr}`);
        }
    });

    test('the command sent on save deploys the class with the real CLI', async () => {
        const file = workspacePath(classPath);
        const call = await nextSfCall(() => editAndSave(file));
        assert.deepStrictEqual(call.argv, ['deploy', 'apex', '-p', file]);

        const deploy = realSf(call.argv);
        assert.strictEqual(deploy.status, 0, `sf ${call.argv.join(' ')} failed:\n${deploy.stdout}${deploy.stderr}`);

        const connection = await Config.getConnection();
        const result = await connection.tooling.query(`SELECT Body FROM ApexClass WHERE Name = '${className}'`);
        assert.strictEqual(result.records.length, 1, `${className} was not found in ${org}`);
        assert.strictEqual(result.records[0].Body, fs.readFileSync(file, 'utf8'));
    });

    test('Refresh From Server replaces local edits with the org copy', async () => {
        const file = workspacePath(classPath);
        const serverCopy = fs.readFileSync(file, 'utf8');
        // Written outside the editor so it is not auto-deployed
        fs.writeFileSync(file, serverCopy + '// local only\n');
        await openInEditor(file);

        await vscode.commands.executeCommand('refresh.source');
        await waitFor(() => fs.readFileSync(file, 'utf8') === serverCopy ? true : undefined, 'the file to be refreshed from the org', 120000);
    });
});
