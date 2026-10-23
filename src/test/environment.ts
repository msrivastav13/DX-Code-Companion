'use strict';

// Builds an isolated VS Code sandbox for the extension-host and Playwright suites: a throwaway
// copy of the fixture project, a private user-data/extensions dir, and a terminal profile whose
// PATH resolves `sf` to the recording shim in test-fixtures/bin.

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export const repoRoot = path.resolve(__dirname, '..', '..');
const fixturesDir = path.join(repoRoot, 'test-fixtures');

export type TestShell = 'bash' | 'zsh' | 'pwsh' | 'powershell' | 'cmd';

// One invocation of the sf shim, as recorded in TestEnvironment.sfLog
export interface SfCall {
    argv: string[];
    cwd: string;
    terminal: string | null;
}

export function readSfCalls(sfLog: string): SfCall[] {
    return fs.readFileSync(sfLog, 'utf8')
        .split('\n')
        .filter(line => line.length > 0)
        .map(line => JSON.parse(line) as SfCall);
}

export interface TestEnvironment {
    root: string;
    workspace: string;
    sfLog: string;
    userDataDir: string;
    extensionsDir: string;
    shell: TestShell;
    // Env vars the VS Code process (and so the extension host and its terminals) needs
    env: { [key: string]: string };
    dispose(): void;
}

interface ShellProfile {
    path: string;
    args: string[];
}

// Profiles skip rc files so a developer's own PATH or aliases can't shadow the sf shim
const shellProfiles: { [shell: string]: ShellProfile } = {
    bash: { path: 'bash', args: ['--noprofile', '--norc'] },
    zsh: { path: 'zsh', args: ['-f'] },
    pwsh: { path: 'pwsh', args: ['-NoLogo', '-NoProfile'] },
    powershell: { path: 'powershell.exe', args: ['-NoLogo', '-NoProfile'] },
    cmd: { path: 'cmd.exe', args: ['/d'] }
};

export function defaultShell(): TestShell {
    return process.platform === 'win32' ? 'powershell' : 'bash';
}

function platformKey(): string {
    switch (process.platform) {
        case 'win32': return 'windows';
        case 'darwin': return 'osx';
        default: return 'linux';
    }
}

export function createTestEnvironment(shell: TestShell = defaultShell(), extraSettings: object = {}): TestEnvironment {
    const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ccdx-e2e-')));
    // Shell metacharacters in the workspace path exercise quoting on every command. Windows keeps
    // a plain name because @vscode/test-electron launches VS Code through cmd.exe there.
    const workspace = path.join(root, process.platform === 'win32' ? 'project' : "my project & 'co'");
    copyDir(path.join(fixturesDir, 'project'), workspace);

    const sfLog = path.join(root, 'sf-calls.jsonl');
    fs.writeFileSync(sfLog, '');

    const userDataDir = path.join(root, 'user-data');
    const extensionsDir = path.join(root, 'extensions');
    fs.mkdirSync(path.join(userDataDir, 'User'), { recursive: true });
    fs.mkdirSync(extensionsDir);

    const env = {
        CCDX_SF_LOG: sfLog,
        CCDX_WORKSPACE: workspace,
        CCDX_TEST_SHELL: shell
    };
    const platform = platformKey();
    const settings: { [key: string]: unknown } = {
        ['terminal.integrated.profiles.' + platform]: { 'ccdx-test': shellProfiles[shell] },
        ['terminal.integrated.defaultProfile.' + platform]: 'ccdx-test',
        ['terminal.integrated.env.' + platform]: Object.assign(
            { PATH: path.join(fixturesDir, 'bin') + path.delimiter + process.env.PATH },
            env
        ),
        'terminal.integrated.shellIntegration.enabled': false,
        'terminal.integrated.enablePersistentSessions': false,
        'security.workspace.trust.enabled': false,
        'workbench.startupEditor': 'none',
        'workbench.tips.enabled': false,
        'extensions.autoUpdate': false,
        'extensions.autoCheckUpdates': false,
        'update.mode': 'none',
        'telemetry.telemetryLevel': 'off',
        'git.enabled': false
    };
    fs.writeFileSync(
        path.join(userDataDir, 'User', 'settings.json'),
        JSON.stringify(Object.assign(settings, extraSettings), null, 2)
    );

    return {
        root, workspace, sfLog, userDataDir, extensionsDir, shell, env,
        dispose: () => {
            if (!process.env.CCDX_KEEP_TEST_DIRS) {
                fs.rmSync(root, { recursive: true, force: true, maxRetries: 5 });
            }
        }
    };
}

function copyDir(from: string, to: string): void {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
        const source = path.join(from, entry.name);
        const target = path.join(to, entry.name);
        if (entry.isDirectory()) {
            copyDir(source, target);
        } else {
            fs.copyFileSync(source, target);
        }
    }
}
