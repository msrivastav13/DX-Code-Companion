'use strict';

// Helpers for suites running inside the extension host. They observe the extension end to end:
// the command it types into a real terminal is parsed by a real shell, and the sf shim on that
// terminal's PATH records the resulting argv in CCDX_SF_LOG.

import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { readSfCalls, SfCall } from './environment';
export { cliPath } from './environment';

export const extensionId = 'MohithShrivastava.dx-code-companion';
export const workspace = process.env.CCDX_WORKSPACE as string;
export const isWindows = process.platform === 'win32';
// Shell commands planted in test inputs write this file if they ever get executed
export const canary = path.join(workspace, 'ccdx-canary');

export function sfCalls(): SfCall[] {
    return readSfCalls(process.env.CCDX_SF_LOG as string);
}

export function workspacePath(...segments: string[]): string {
    return path.join(workspace, ...segments);
}

export async function waitFor<T>(probe: () => T | undefined, description: string, timeoutMs: number = 30000): Promise<T> {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
        const value = probe();
        if (value !== undefined) {
            return value;
        }
        if (Date.now() > deadline) {
            throw new Error(`Timed out after ${timeoutMs}ms waiting for ${description}`);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

let barrierCount = 0;

// Waits until everything typed into the DX Companion terminal so far has finished running, by typing
// a uniquely marked sf call after it, and returns the calls made since index `from` (barriers excluded).
async function drainTerminal(from: number): Promise<SfCall[]> {
    const terminal = vscode.window.terminals.find(candidate => candidate.name === 'DX Companion');
    if (terminal) {
        const marker = 'barrier-' + (++barrierCount);
        terminal.sendText('sf ccdx-barrier ' + marker);
        await waitFor(() => sfCalls().some(call => call.argv[1] === marker) ? true : undefined, 'the terminal to drain');
    }
    if (fs.existsSync(canary)) {
        fs.unlinkSync(canary);
        assert.fail('an injected shell command was executed');
    }
    return sfCalls().slice(from).filter(call => call.argv[0] !== 'ccdx-barrier');
}

// Runs an action and returns the single sf invocation it produced in the terminal
export async function nextSfCall(action: () => unknown): Promise<SfCall> {
    const before = sfCalls().length;
    await action();
    await waitFor(() => sfCalls()[before], 'the sf CLI to be invoked from the terminal');
    const calls = await drainTerminal(before);
    assert.strictEqual(calls.length, 1, `expected one sf call, got ${JSON.stringify(calls.map(call => call.argv))}`);
    return calls[0];
}

export const shownErrors: string[] = [];

// Asserts the extension refuses the action with an error and types nothing into the terminal
export async function assertRefused(action: () => unknown): Promise<void> {
    shownErrors.length = 0;
    const before = sfCalls().length;
    await action();
    const refused = await waitFor(() => shownErrors.some(message => message.indexOf('Refusing to run command') !== -1) ? true : undefined,
        'a refusal error', 10000).then(() => true, () => false);
    // Drain even when no error was shown, so anything the action typed runs (and is caught) within this test
    assert.deepStrictEqual((await drainTerminal(before)).map(call => call.argv), [], 'expected nothing to be sent to the terminal');
    assert.ok(refused, `expected a "Refusing to run command" error, got ${JSON.stringify(shownErrors)}`);
}

// Replaces the method obj[key] until the returned restore function is called
export function stub<T, K extends keyof T>(obj: T, key: K, replacement: (...args: any[]) => unknown): () => void {
    const original = obj[key];
    obj[key] = replacement as unknown as T[K];
    return () => {
        obj[key] = original;
    };
}

export function writeWorkspaceFile(relativePath: string, content: string): string {
    const file = workspacePath(relativePath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
    return file;
}

export async function openInEditor(file: string): Promise<vscode.TextEditor> {
    const document = await vscode.workspace.openTextDocument(file);
    return vscode.window.showTextDocument(document);
}

// Edits and saves the file through VS Code, which fires the extension's save-to-server listener
export async function editAndSave(file: string): Promise<void> {
    const editor = await openInEditor(file);
    const end = editor.document.lineAt(editor.document.lineCount - 1).range.end;
    await editor.edit(edit => edit.insert(end, '\n'));
    await editor.document.save();
}

// Activates the extension and records error notifications into shownErrors; returns a restore function
export async function activateExtension(): Promise<() => void> {
    const extension = vscode.extensions.getExtension(extensionId);
    assert.ok(extension, `${extensionId} is not installed in the test instance`);
    await extension.activate();
    return stub(vscode.window, 'showErrorMessage', (message: string) => {
        shownErrors.push(message);
        return Promise.resolve(undefined);
    });
}
