'use strict';

// Launches a real VS Code (downloaded by @vscode/test-electron) with the extension under development
// and runs the mocha suites inside its extension host, once per terminal shell.
//
//   node out/test/runTest.js [integration|org]   (default: integration)
//   CCDX_TEST_SHELLS  comma-separated shells to run against (default: bash,zsh on macOS/Linux, powershell on Windows)
//   CCDX_VSCODE_VERSION  VS Code version to download (default: stable)
//   CCDX_TEST_ORG     username/alias of a disposable org, required by the org suite

import * as cp from 'child_process';
import * as path from 'path';
import { runTests } from '@vscode/test-electron';
import { createTestEnvironment, defaultShell, repoRoot, TestShell } from './environment';

function isInstalled(shell: TestShell): boolean {
    const probe = cp.spawnSync(shell === 'powershell' ? 'powershell.exe' : shell === 'cmd' ? 'cmd.exe' : shell,
        shell === 'cmd' ? ['/d', '/c', 'exit 0'] : ['-c', 'exit 0']);
    return probe.status === 0;
}

function shellsToTest(suite: string): TestShell[] {
    if (process.env.CCDX_TEST_SHELLS) {
        return process.env.CCDX_TEST_SHELLS.split(',').map(shell => shell.trim() as TestShell);
    }
    if (suite === 'org' || process.platform === 'win32') {
        return [defaultShell()];
    }
    return (['bash', 'zsh'] as TestShell[]).filter(isInstalled);
}

async function main(): Promise<void> {
    const suite = process.argv[2] || 'integration';
    if (suite === 'org' && !process.env.CCDX_TEST_ORG) {
        throw new Error('The org suite needs CCDX_TEST_ORG set to the username or alias of a disposable org');
    }
    for (const shell of shellsToTest(suite)) {
        console.log(`\n=== ${suite} suite, ${shell} terminal ===`);
        const testEnv = createTestEnvironment(shell);
        try {
            await runTests({
                version: process.env.CCDX_VSCODE_VERSION || 'stable',
                extensionDevelopmentPath: repoRoot,
                extensionTestsPath: path.resolve(__dirname, 'index'),
                launchArgs: [
                    testEnv.workspace,
                    '--user-data-dir=' + testEnv.userDataDir,
                    '--extensions-dir=' + testEnv.extensionsDir,
                    '--disable-extensions'
                ],
                extensionTestsEnv: Object.assign({}, testEnv.env, {
                    CCDX_TEST_SUITE: suite,
                    // Makes the extension's @salesforce/core config resolve the test org as the default
                    SF_TARGET_ORG: process.env.CCDX_TEST_ORG || ''
                })
            });
        } finally {
            testEnv.dispose();
        }
    }
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
