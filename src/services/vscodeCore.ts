'use strict';

import * as vscode from 'vscode';
import {OSUtil} from './osUtils';

export class VSCodeCore {

    private static terminalName: string = 'DX Companion';

    private static ensureTerminalExists(): boolean {
        if ((<any>vscode.window).terminals.length === 0) {
            return false;
        }
        return true;
    }

    public static setupTerminal(): vscode.Terminal {
        let activeTerminal;
        if(this.ensureTerminalExists()){
            activeTerminal = vscode.window.terminals[0];
            if(activeTerminal){
                activeTerminal.show(true);
            }
        } else {
            // Create Terminal via VScode API
            const terminalName = this.terminalName;
            activeTerminal = vscode.window.createTerminal(terminalName);
            activeTerminal.show(true);
        }
        return activeTerminal;
    }

    public static getFsPath(): string {
        let path = '';
        if(vscode.window.activeTextEditor) {
            path = vscode.window.activeTextEditor.document.uri.fsPath;
            if(process.platform.includes('win')) {
                path = OSUtil.toUnixStyle(path); //change to unix style for windows
            }
        }
        return path;
    }

    public static showActivationMessage(): vscode.StatusBarItem {
        const ccdx = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 90);
        ccdx.text = `DX Code Companion $(check)`;
        ccdx.tooltip = 'SalesforceDX Code Companion is Active ! Enjoy!!!!';
        ccdx.show();
        return ccdx;
    }
}