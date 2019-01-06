'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {DeploySource} from './services/deploy';
import {NavigationService} from './services/openInSalesforce';
import {RetrieveSource} from './services/retrieve';
import {switchOrg} from './services/switchOrg';
import {VSCodeCore} from './services/vscodeCore';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const retrieveSource = vscode.commands.registerCommand('retrieve.dxSource', () => {
        RetrieveSource.retrieve('sfdx retrieve:dxsource -n ');
    });

    const retrievepkgSource = vscode.commands.registerCommand('retrieve.pkgSource', () => {
        RetrieveSource.retrieve('sfdx retrieve:pkgsource -n ');
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
        DeploySource.deploy();
    });

    context.subscriptions.push(retrieveSource);
    context.subscriptions.push(retrievepkgSource);
    context.subscriptions.push(deploySource);
    context.subscriptions.push(openLightningAppPage);
    context.subscriptions.push(openMetadataCoverage);
    context.subscriptions.push(openComponentLibrary);
    context.subscriptions.push(openVFPage);
    context.subscriptions.push(openSLDS);
    context.subscriptions.push(switchorg);
    //Support on save compile
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((textDocument: vscode.TextDocument) => {
        if(vscode.workspace.getConfiguration('dx-code-companion').autosave.enabled) {
            //At this point only few file types are supported for auto save
            if(vscode.window.activeTextEditor){
                const supportedFileTypes = ['trigger','cls','cmp','js','html','evt','css','design','tokens','page','svg','auradoc','component','intf','app','xml'];
                const filePath = vscode.window.activeTextEditor.document.uri.fsPath;
                const pathAsArray = filePath.split('/');
                const lastparam = pathAsArray[pathAsArray.length - 1];
                const fileExtension = lastparam.substring(lastparam.lastIndexOf('.') + 1);
                if(supportedFileTypes.indexOf(fileExtension) !== -1){
                    vscode.commands.executeCommand('deploy.source');
                }
            }
        }
    }));
}
    // this method is called when your extension is deactivated
    export function deactivate() {

    }