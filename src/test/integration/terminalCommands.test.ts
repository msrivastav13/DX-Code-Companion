'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';
import {
    activateExtension, assertRefused, cliPath, editAndSave, isWindows, nextSfCall,
    openInEditor, sfCalls, stub, waitFor, workspacePath, writeWorkspaceFile
} from '../helpers';

// Values that are harmless when quoted but run a command if the shell ever sees them unquoted.
// Windows rejects cmd.exe operators outright (see the Windows-only test) and forbids '>' in file
// names, so there the payload is a PowerShell statement separator and can't write the canary.
const injected = isWindows ? 'x; echo pwned' : 'x;echo pwned > ccdx-canary';

suite('Terminal commands', () => {
    let restoreErrors: () => void;

    suiteSetup(async () => {
        restoreErrors = await activateExtension();
        await waitFor(() => sfCalls()[0], 'the activation command');
    });

    suiteTeardown(() => restoreErrors());

    test('installs mo-dx-plugin on activation', () => {
        assert.deepStrictEqual(sfCalls()[0].argv, ['plugins', 'install', 'mo-dx-plugin@latest']);
    });

    test('saving an Apex class deploys it', async () => {
        const file = workspacePath('force-app/main/default/classes/CcdxFoo.cls');
        const call = await nextSfCall(() => editAndSave(file));
        assert.deepStrictEqual(call.argv, ['deploy', 'apex', '-p', cliPath(file)]);
    });

    test('saving an LWC file deploys the bundle file', async () => {
        const file = workspacePath('force-app/main/default/lwc/helloWorld/helloWorld.js');
        const call = await nextSfCall(() => editAndSave(file));
        assert.deepStrictEqual(call.argv, ['deploy', 'lwc', '-p', cliPath(file)]);
    });

    test('shell metacharacters in a file path reach the CLI literally', async () => {
        const file = writeWorkspaceFile(`force-app/main/default/classes/${injected}/CcdxSemi.cls`, 'public class CcdxSemi {}');
        const call = await nextSfCall(() => editAndSave(file));
        assert.deepStrictEqual(call.argv, ['deploy', 'apex', '-p', cliPath(file)]);
    });

    const unsafeNames = isWindows
        ? ['CcdxEvil$(whoami).cls']
        : ['CcdxEvil$(echo pwned > ccdx-canary).cls', 'CcdxEvil`echo pwned > ccdx-canary`.cls'];
    for (const name of unsafeNames) {
        test(`refuses to deploy a file named ${name}`, async () => {
            const file = writeWorkspaceFile(`force-app/main/default/classes/${name}`, 'public class CcdxEvil {}');
            await assertRefused(() => editAndSave(file));
        });
    }

    test('static resource folder setting is passed as a single argument', async () => {
        const config = vscode.workspace.getConfiguration('dx-code-companion');
        const folderName = 'app' + injected;
        await config.update('staticresourcefolder.resourceBundleFoldername', folderName, vscode.ConfigurationTarget.Workspace);
        try {
            const folder = workspacePath('force-app/main/default', folderName);
            const file = writeWorkspaceFile(`force-app/main/default/${folderName}/index.html`, '<p>hi</p>');

            const onSave = await nextSfCall(() => editAndSave(file));
            assert.deepStrictEqual(onSave.argv, ['deploy', 'staticresource', '-p', cliPath(file), '-r', folderName]);

            const fromExplorer = await nextSfCall(() => vscode.commands.executeCommand('deploy.staticresource', vscode.Uri.file(folder)));
            assert.deepStrictEqual(fromExplorer.argv, ['deploy', 'staticresource', '-p', cliPath(folder), '-r', folderName]);
        } finally {
            await config.update('staticresourcefolder.resourceBundleFoldername', undefined, vscode.ConfigurationTarget.Workspace);
        }
    });

    test('changeset deploy quotes the folder and the org picked from orgs.json', async () => {
        const username = 'admin@example.com' + injected;
        const restore = stub(vscode.window, 'showQuickPick', () => Promise.resolve(username));
        try {
            const src = vscode.Uri.file(workspacePath('changesets/release1/src'));
            const call = await nextSfCall(() => vscode.commands.executeCommand('deploy.src', src));
            assert.deepStrictEqual(call.argv, ['project', 'deploy', 'start', '-d', src.path, '--metadata-dir', '-w', '-1', '-u', username]);
        } finally {
            restore();
        }
    });

    test('changeset deploy refuses an org username containing $(...)', async () => {
        const restore = stub(vscode.window, 'showQuickPick', () => Promise.resolve('$(whoami)@example.com'));
        try {
            const src = vscode.Uri.file(workspacePath('changesets/release1/src'));
            await assertRefused(() => vscode.commands.executeCommand('deploy.src', src));
        } finally {
            restore();
        }
    });

    test('changeset retrieve quotes the changeset name and target folder', async () => {
        const name = 'Q3 Release' + injected;
        const restore = stub(vscode.window, 'showInputBox', () => Promise.resolve(name));
        try {
            const call = await nextSfCall(() => vscode.commands.executeCommand('changeset.retrieve'));
            const folder = 'changesets/' + name.trim().toLowerCase().replace(/\s/g, '') + '/src';
            assert.deepStrictEqual(call.argv, ['retrieve', 'pkgsource', '-n', name, '-r', folder]);
        } finally {
            restore();
        }
    });

    // PowerShell passes an argument without spaces to sf.cmd unquoted, so cmd.exe would run what follows '&'
    (isWindows ? test : test.skip)('refuses cmd.exe operators on Windows', async () => {
        const restore = stub(vscode.window, 'showInputBox', () => Promise.resolve('release&echo pwned'));
        try {
            await assertRefused(() => vscode.commands.executeCommand('changeset.retrieve'));
        } finally {
            restore();
        }
    });

    test('switch org quotes the chosen alias', async () => {
        const alias = 'dev' + injected;
        const restore = stub(vscode.window, 'showQuickPick', () => Promise.resolve(alias + ':admin@example.com'));
        try {
            const call = await nextSfCall(() => vscode.commands.executeCommand('switch.org'));
            assert.deepStrictEqual(call.argv, ['config', 'set', 'target-org=' + alias]);
        } finally {
            restore();
        }
    });

    test('open Visualforce page opens the page by name', async () => {
        await openInEditor(workspacePath('force-app/main/default/pages/CcdxPage.page'));
        const call = await nextSfCall(() => vscode.commands.executeCommand('open.vf'));
        assert.deepStrictEqual(call.argv, ['org', 'open', '-p', '/apex/CcdxPage']);
    });

    test('open Lightning page passes the active file', async () => {
        const file = workspacePath('force-app/main/default/classes/CcdxFoo.cls');
        await openInEditor(file);
        const call = await nextSfCall(() => vscode.commands.executeCommand('open.lightningPage'));
        assert.deepStrictEqual(call.argv, ['org', 'open', '-f', cliPath(file)]);
    });

    test('commands go only to the DX Companion terminal, never to another open terminal', async () => {
        vscode.window.terminals.forEach(terminal => terminal.dispose());
        await waitFor(() => vscode.window.terminals.length === 0 ? true : undefined, 'terminals to close');

        const userTerminal = vscode.window.createTerminal({ name: 'User shell', env: { CCDX_TERMINAL_TAG: 'user' } });
        userTerminal.show();
        try {
            const first = await nextSfCall(() => vscode.commands.executeCommand('open.org'));
            const second = await nextSfCall(() => vscode.commands.executeCommand('open.org'));
            assert.strictEqual(first.terminal, null, 'command was typed into the user terminal');
            assert.strictEqual(second.terminal, null, 'command was typed into the user terminal');
            assert.strictEqual(vscode.window.terminals.filter(terminal => terminal.name === 'DX Companion').length, 1,
                'expected exactly one reused DX Companion terminal');
        } finally {
            userTerminal.dispose();
        }
    });
});
