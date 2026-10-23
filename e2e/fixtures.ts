import * as cp from 'child_process';
import { _electron, ElectronApplication, expect, Page, test as base } from '@playwright/test';
import { resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import { createTestEnvironment, readSfCalls, SfCall, TestEnvironment } from '../src/test/environment';

export { expect };

interface Options {
    // false opens the workspace in Restricted Mode (Workspace Trust enabled, folder not trusted)
    trusted: boolean;
}

interface Fixtures {
    sandbox: TestEnvironment;
    vscode: { app: ElectronApplication; page: Page };
}

function installVsix(sandbox: TestEnvironment): void {
    const [cli] = resolveCliArgsFromVSCodeExecutablePath(process.env.CCDX_VSCODE_EXECUTABLE as string);
    const result = cp.spawnSync(cli, [
        '--install-extension', process.env.CCDX_VSIX as string,
        '--extensions-dir=' + sandbox.extensionsDir,
        '--user-data-dir=' + sandbox.userDataDir
    ], { encoding: 'utf8', shell: process.platform === 'win32' });
    if (result.status !== 0) {
        throw new Error(`Installing the VSIX failed: ${result.stdout}${result.stderr}`);
    }
}

export const test = base.extend<Fixtures & Options>({
    trusted: [true, { option: true }],

    sandbox: async ({ trusted }, use) => {
        const sandbox = createTestEnvironment(undefined, trusted ? {} : {
            'security.workspace.trust.enabled': true,
            'security.workspace.trust.startupPrompt': 'never'
        });
        installVsix(sandbox);
        await use(sandbox);
        sandbox.dispose();
    },

    vscode: async ({ sandbox }, use, testInfo) => {
        const app = await _electron.launch({
            executablePath: process.env.CCDX_VSCODE_EXECUTABLE as string,
            args: [
                sandbox.workspace,
                '--user-data-dir=' + sandbox.userDataDir,
                '--extensions-dir=' + sandbox.extensionsDir,
                '--no-sandbox',
                '--disable-gpu-sandbox',
                '--disable-updates',
                '--skip-welcome',
                '--skip-release-notes',
                '--new-window'
            ],
            env: Object.assign({}, process.env, sandbox.env) as { [key: string]: string }
        });
        await app.context().tracing.start({ screenshots: true, snapshots: true });
        const page = await app.firstWindow();
        await page.locator('.monaco-workbench').waitFor();

        await use({ app, page });

        const failed = testInfo.status !== testInfo.expectedStatus;
        if (failed) {
            await testInfo.attach('screenshot', { body: await page.screenshot(), contentType: 'image/png' });
        }
        await app.context().tracing.stop(failed ? { path: testInfo.outputPath('trace.zip') } : undefined);
        await app.close();
    }
});

export function sfArgvs(sandbox: TestEnvironment): string[][] {
    return readSfCalls(sandbox.sfLog).map((call: SfCall) => call.argv);
}

export async function runCommand(page: Page, title: string): Promise<void> {
    await page.keyboard.press('F1');
    await page.locator('.quick-input-widget input').fill('>' + title);
    await page.locator('.quick-input-list .monaco-list-row', { hasText: title }).first().waitFor();
    await page.keyboard.press('Enter');
}

export async function openFile(page: Page, fileName: string): Promise<void> {
    await page.keyboard.press('ControlOrMeta+P');
    await page.locator('.quick-input-widget input').fill(fileName);
    await page.locator('.quick-input-list .monaco-list-row', { hasText: fileName }).first().waitFor();
    await page.keyboard.press('Enter');
    await expect(page.locator('.tab.active', { hasText: fileName })).toBeVisible();
}

// Types into the active editor and saves with the keyboard shortcut, like a user would
export async function editAndSave(page: Page): Promise<void> {
    await page.locator('.editor-group-container.active .monaco-editor .view-lines').click();
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.type('\n// e2e');
    await page.keyboard.press('ControlOrMeta+S');
}
