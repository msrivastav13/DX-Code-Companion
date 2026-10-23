import * as fs from 'fs';
import * as path from 'path';
import { cliPath } from '../src/test/environment';
import { editAndSave, expect, openFile, runCommand, sfArgvs, test } from './fixtures';

const statusBarItem = '.statusbar-item';

test.describe('trusted workspace', () => {
    test('activates from the packaged VSIX and installs mo-dx-plugin', async ({ vscode: { page }, sandbox }) => {
        await expect(page.locator(statusBarItem, { hasText: 'DX Code Companion' })).toBeVisible();
        await expect.poll(() => sfArgvs(sandbox)).toContainEqual(['plugins', 'install', 'mo-dx-plugin@latest']);
    });

    test('a CCDX command from the Command Palette runs in the terminal', async ({ vscode: { page }, sandbox }) => {
        await runCommand(page, 'CCDX: Open Default Org');
        await expect.poll(() => sfArgvs(sandbox)).toContainEqual(['org', 'open']);
    });

    test('saving an Apex class deploys it', async ({ vscode: { page }, sandbox }) => {
        await openFile(page, 'CcdxFoo.cls');
        await editAndSave(page);
        const file = path.join(sandbox.workspace, 'force-app/main/default/classes/CcdxFoo.cls');
        await expect.poll(() => sfArgvs(sandbox)).toContainEqual(['deploy', 'apex', '-p', cliPath(file)]);
    });

    test('a malicious file name shows an error and runs nothing', async ({ vscode: { page }, sandbox }) => {
        test.skip(process.platform === 'win32', 'the payload needs characters Windows file names cannot contain');
        const name = 'CcdxEvil$(echo pwned > ccdx-canary).cls';
        fs.writeFileSync(path.join(sandbox.workspace, 'force-app/main/default/classes', name), 'public class CcdxEvil {}');

        await openFile(page, 'CcdxEvil');
        await editAndSave(page);
        await expect(page.locator('.notifications-toasts', { hasText: 'Refusing to run command' })).toBeVisible();

        // Anything typed before this command would have run by the time it is logged
        await runCommand(page, 'CCDX: Open Default Org');
        await expect.poll(() => sfArgvs(sandbox)).toContainEqual(['org', 'open']);
        expect(sfArgvs(sandbox).filter(argv => argv[0] === 'deploy')).toEqual([]);
        expect(fs.existsSync(path.join(sandbox.workspace, 'ccdx-canary'))).toBe(false);
    });
});

test.describe('untrusted workspace', () => {
    test.use({ trusted: false });

    test('stays disabled in Restricted Mode', async ({ vscode: { page }, sandbox }) => {
        await expect(page.locator(statusBarItem, { hasText: 'Restricted Mode' })).toBeVisible();

        // Activation would happen within a few seconds of startup; give it time to (not) happen
        await page.waitForTimeout(5000);
        await expect(page.locator(statusBarItem, { hasText: 'DX Code Companion' })).toHaveCount(0);
        expect(sfArgvs(sandbox)).toEqual([]);

        // Contributed commands of a trust-disabled extension are not offered
        await page.keyboard.press('F1');
        await page.locator('.quick-input-widget input').fill('>CCDX: Open Default Org');
        const rows = page.locator('.quick-input-list .monaco-list-row');
        await expect(rows.first()).toBeVisible();
        await expect(rows.filter({ hasText: 'CCDX:' })).toHaveCount(0);
    });
});
