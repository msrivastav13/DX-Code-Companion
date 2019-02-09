'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {Config} from './services/config';
import CodeCompanionContentProvider from './providers/contentProvider' ;
import {DeploySource} from './services/deploy';
import {NavigationService} from './services/navigation';
import {RetrieveSource} from './services/retrieve';
import {switchOrg} from './services/switchOrg';
import {VSCodeCore} from './services/vscodeCore';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // show activation message
    VSCodeCore.showActivationMessage();

    const retrieveSource = vscode.commands.registerCommand('retrieve.dxSource', async () => {
        const connection = await Config.getConnection();
        const retrievesrc = new RetrieveSource(connection);
        retrievesrc.retrieve('sfdx retrieve:dxsource -n ');
    });

    const retrievepkgSource = vscode.commands.registerCommand('retrieve.pkgSource', async () => {
        const connection = await Config.getConnection();
        const retrievesrc = new RetrieveSource(connection);
        retrievesrc.retrieve('sfdx retrieve:pkgsource -n ');
    });

    const openSLDS = vscode.commands.registerCommand('open.slds', () => {
        NavigationService.openSLDSDocument();
    });

    const openMetadataCoverage = vscode.commands.registerCommand('open.metadataCoverageReport', () => {
        NavigationService.metadataCoverageReport();
    });

    const openComponentLibrary = vscode.commands.registerCommand('open.componentLibrary', () => {
        NavigationService.componentLibrary();
    });

    const openSalesforceOrg = vscode.commands.registerCommand('open.org', () => {
        let activeTerminal = VSCodeCore.setupTerminal();
        if(activeTerminal){
            let openCmd = 'sfdx force:org:open';
            activeTerminal.sendText(openCmd);
        }
    });

    const openVFPage = vscode.commands.registerCommand('open.vf', () => {
        let activeTerminal = VSCodeCore.setupTerminal();
        if(activeTerminal){
            let openCmd = 'sfdx force:org:open -p /apex/' + NavigationService.openVFPage(VSCodeCore.getFsPath());
            activeTerminal.sendText(openCmd);
        }
    });

    const openLightningAppPage = vscode.commands.registerCommand('open.lightningPage', () => {
        let activeTerminal = VSCodeCore.setupTerminal();
        if(activeTerminal){
            let openCmd = 'sfdx force:source:open -f ' + '"' + VSCodeCore.getFsPath() + '"';
            activeTerminal.sendText(openCmd);
        }
    });

    const switchorg = vscode.commands.registerCommand('switch.org', async () => {
        await switchOrg();
    });

    const deploySource = vscode.commands.registerCommand('deploy.source', () => {
        if(vscode.window.activeTextEditor){
            DeploySource.deployToSFDC(vscode.window.activeTextEditor.document);
        }    
    });

    const refreshSource = vscode.commands.registerCommand('refresh.source', async () => {
        if(vscode.window.activeTextEditor){
            DeploySource.refreshFromServer(vscode.window.activeTextEditor.document);
        }
    });

    // Provider for compare view when server files are modified
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('codecompanion', CodeCompanionContentProvider.getInstance()));
    // Trigger Deploy on Save
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((textDocument: vscode.TextDocument) => {
        DeploySource.deploy(textDocument);
    }));
    context.subscriptions.push(deploySource);
    context.subscriptions.push(refreshSource);
    context.subscriptions.push(retrieveSource);
    context.subscriptions.push(retrievepkgSource);
    context.subscriptions.push(openLightningAppPage);
    context.subscriptions.push(openMetadataCoverage);
    context.subscriptions.push(openComponentLibrary);
    context.subscriptions.push(openVFPage);
    context.subscriptions.push(openSLDS);
    context.subscriptions.push(switchorg);
    context.subscriptions.push(openSalesforceOrg);
}
// this method is called when your extension is deactivated
export function deactivate() {
    VSCodeCore.showActivationMessage().dispose();
}