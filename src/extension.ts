'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {CommandService} from './services/commandBuilder';
import {NavigationService} from './services/openInSalesforce';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const retrieveSource = vscode.commands.registerCommand('retrieve.dxSource', () => {
        retrieveDXSource('sfdx retrieve:dxsource -n ');
    });

    const retrievepkgSource = vscode.commands.registerCommand('retrieve.pkgSource', () => {
        retrieveDXSource('sfdx retrieve:pkgsource -n ');
    });

    const openMetadataCoverage = vscode.commands.registerCommand('open.metadataCoverageReport', () => {
        NavigationService.metadataCoverageReport();
    });

    const openComponentLibrary = vscode.commands.registerCommand('open.componentLibrary', () => {
        NavigationService.componentLibrary();
    });

    const openVFPage = vscode.commands.registerCommand('open.vf', () => {
        let activeTerminal = setupTerminal();
        if(activeTerminal){
            let openCmd = 'sfdx force:org:open -p /apex/' + NavigationService.openVFPage(getPath());
            activeTerminal.sendText(openCmd);
        }
    });

    const openLightningAppPage = vscode.commands.registerCommand('open.lightningPage', () => {
        let activeTerminal = setupTerminal();
        if(activeTerminal){
            let openCmd = 'sfdx force:source:open -f ' + '"' + getPath() + '"';
            activeTerminal.sendText(openCmd);
        }
    });

    const deploySource = vscode.commands.registerCommand('deploy.source', () => {
        let activeTerminal = setupTerminal();
        if(activeTerminal){
            if(vscode.window.activeTextEditor){
                let path = getPath();
                const commandToExecute = new CommandService(path);
                activeTerminal.sendText(commandToExecute.generateCommand());
                console.log(process.platform);
            }
        }

    });

    context.subscriptions.push(retrieveSource);
    context.subscriptions.push(retrievepkgSource);
    context.subscriptions.push(deploySource);
    context.subscriptions.push(openLightningAppPage);
    context.subscriptions.push(openMetadataCoverage);
    context.subscriptions.push(openComponentLibrary);
    context.subscriptions.push(openVFPage);
}

    function setupTerminal() {
        let activeTerminal;
        if(ensureTerminalExists()){
            activeTerminal = vscode.window.terminals[0];
            if(activeTerminal){
                activeTerminal.show(true);
            }
        } else {
            // Create Terminal via VScode API
            const terminalName = 'DX Companion';
            activeTerminal = vscode.window.createTerminal(terminalName);
            activeTerminal.show(true);
        }
        return activeTerminal;
    }

    async function retrieveDXSource(cmd: string){
        const unmanagedpkg = await showInputBox('Enter Package Name');
        if(unmanagedpkg) {
            let activeTerminal = setupTerminal();
            if(activeTerminal){
                let retrievecommand = cmd + '"' + unmanagedpkg + '"';
                activeTerminal.sendText(retrievecommand);
            }
        }
    }

    async function showInputBox(placeholder: string) {
        const result = await vscode.window.showInputBox({
            ignoreFocusOut : true,
            value: undefined,
            valueSelection: [2, 4],
            placeHolder: placeholder,
            prompt: placeholder
        });
        return result;
    }

    function ensureTerminalExists(): boolean {
        if ((<any>vscode.window).terminals.length === 0) {
            return false;
        }
        return true;
    }

    function toUnixStyle(path: string): string {
        return path.replace(/\\/g, "/");
    }

    function getPath() : string {
        let path = '';
        if(vscode.window.activeTextEditor) {
            path = vscode.window.activeTextEditor.document.uri.fsPath;
            if(process.platform.includes('win')) {
                path = toUnixStyle(path); //change to unix style for windows
            }
        }
        return path;
    }

    // this method is called when your extension is deactivated
    export function deactivate() {

    }