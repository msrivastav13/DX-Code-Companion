import * as cp from 'child_process';
import * as os from 'os';
import * as path from 'path';
import { downloadAndUnzipVSCode } from '@vscode/test-electron';
import { repoRoot } from '../src/test/environment';

// Downloads VS Code and packages the extension once per run; tests install that VSIX.
// Set CCDX_VSIX to test an already-built VSIX (e.g. the release artifact) instead.
export default async function globalSetup(): Promise<void> {
    process.env.CCDX_VSCODE_EXECUTABLE = await downloadAndUnzipVSCode(process.env.CCDX_VSCODE_VERSION || 'stable');
    if (!process.env.CCDX_VSIX) {
        const vsix = path.join(os.tmpdir(), `dx-code-companion-e2e-${process.pid}.vsix`);
        cp.execFileSync(process.execPath, [path.join(repoRoot, 'node_modules', '@vscode', 'vsce', 'vsce'), 'package', '--out', vsix],
            { cwd: repoRoot, stdio: 'inherit' });
        process.env.CCDX_VSIX = vsix;
    }
}
