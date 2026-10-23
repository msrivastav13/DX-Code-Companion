'use strict';

import * as vscode from 'vscode';
import { OSUtil } from './osUtils';

export class VSCodeCore {

    private static terminalName: string = 'DX Companion';

    // Characters a shell still interprets inside double quotes (bash/zsh: $ ` \ !;
    // PowerShell: $ ` and smart quotes) or that terminate the command line.
    private static unsafeShellChars: RegExp = /["`$\\!\r\n\u201C\u201D\u201E]/;
    // On Windows sf is a .cmd batch file: PowerShell drops the quotes around an argument without spaces
    // before handing it to cmd.exe, which then treats these as command operators or variable expansion.
    private static unsafeBatchChars: RegExp = /[&|<>^%]/;

    private static setupTerminal(): vscode.Terminal {
        // Only reuse our own terminal so commands never land in an unrelated shell or REPL
        let activeTerminal = vscode.window.terminals.find(terminal => terminal.name === this.terminalName);
        if (!activeTerminal) {
            activeTerminal = vscode.window.createTerminal(this.terminalName);
        }
        activeTerminal.show(true);
        return activeTerminal;
    }

    // Wraps a value in double quotes for use as a single terminal argument.
    // Throws if the value could break out of the quotes or run a sub-command.
    public static quoteArg(value: string): string {
        if (this.unsafeShellChars.test(value) || (OSUtil.isWindowsOs() && this.unsafeBatchChars.test(value))) {
            throw new Error(`Refusing to run command: ${JSON.stringify(value)} contains characters the terminal shell would interpret`);
        }
        return '"' + value + '"';
    }

    // Builds a command and sends it to the DX Companion terminal; a rejected argument is shown as an error instead.
    public static runCommand(buildCommand: () => string): void {
        let command: string;
        try {
            command = buildCommand();
        } catch (error) {
            vscode.window.showErrorMessage(error instanceof Error ? error.message : String(error));
            return;
        }
        this.setupTerminal().sendText(command);
    }

    public static getFsPath(): string {
        let path = '';
        if(vscode.window.activeTextEditor) {
            path = vscode.window.activeTextEditor.document.uri.fsPath;
            if(OSUtil.isWindowsOs()) {
                path = OSUtil.toUnixStyle(path); //change to unix style for windows
            }
        }
        return path;
    }

    public static showActivationMessage(): vscode.StatusBarItem {
        vscode.commands.executeCommand('setContext', 'CCDXActive', true);
        const ccdx = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 90);
        ccdx.text = `DX Code Companion $(rocket)`;
        ccdx.tooltip = 'SalesforceDX Code Companion is Active ! Enjoy!!!!';
        ccdx.command = 'open.org';
        ccdx.show();
        return ccdx;
    }
}