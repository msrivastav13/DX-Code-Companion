'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {Config} from './config';
import {SalesforceUtil} from './sfdcUtils';
import {CommandService} from './commandBuilder';
import CodeCompanionContentProvider from '../providers/contentProvider';
import {ServerResult} from '../typings/ccdxTypings';
import {VSCodeCore} from './vscodeCore';


export class DeploySource {

    private static lastSavedToServer: string;

    public static deployToSFDC(textDocument: vscode.TextDocument) {
        if(this.supportedFileForDeploy()) {
            // The authorization creates sfdx-project.json files and this extension supports only auth done using sfdx cli
            if(this.isProjectAuthroizedToSFDC()) {
                if(vscode.window.activeTextEditor) {
                    const filepath = VSCodeCore.getFsPath();
                    const filename = path.basename(textDocument.fileName).split('.')[0];
                    const fileextension = path.basename(textDocument.fileName).split('.')[1];
                    const commandToExecute = new CommandService(filepath);
                    if(vscode.workspace.getConfiguration('dx-code-companion').manageconflict.enabled) {
                        const metadataType = commandToExecute.metadataDef.getMetadataType().MetadataName;
                        this.save(metadataType, filename, textDocument, commandToExecute,fileextension);
                    } else {
                        this.executeDeployCommand(commandToExecute);
                    }
                }
            } else {
                vscode.window.showErrorMessage('Authorize a salesforce org');
            }
        }
    }

    private static save(metadataType: string, filename: string, textDocument: vscode.TextDocument, commandToExecute: CommandService, fileextension: string) {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Comparing with server copy",
        }, () => {
            var p = new Promise(async (resolve) => {
                const serverResponse = await this.getServerCopy(metadataType, filename, fileextension);
                if(serverResponse.exist) {
                    // Set content provider content
                    CodeCompanionContentProvider.serverContent = serverResponse.Body;
                    if (!this.compare(textDocument.getText(), serverResponse.Body) && !this.compare(serverResponse.Body, this.lastSavedToServer)) {
                        var sfuri: vscode.Uri = vscode.Uri.parse(`codecompanion://salesforce.com/${metadataType}/${filename}?${Date.now()}`);
                        vscode.commands.executeCommand('vscode.diff', sfuri, textDocument.uri, `${filename}.${fileextension}(SERVER) <~> ${filename}.${fileextension} (LOCAL)`, { preview: true });
                        vscode.window.showWarningMessage('File has been modified in salesforce', 'Refresh From Server', 'Overwrite Server Copy', 'Cancel').then(s => {
                            if (s === 'Overwrite Server Copy') {
                                this.run(commandToExecute, textDocument);
                            }
                        });
                    }
                    else {
                        this.run(commandToExecute, textDocument);
                    }
                }
                else {
                    this.run(commandToExecute, textDocument);
                }
                resolve();
            });
            return p;
        });
    }

    private static run(commandToExecute: CommandService, textDocument: vscode.TextDocument) {
        this.lastSavedToServer = textDocument.getText();
        this.executeDeployCommand(commandToExecute);
    }

    public static deploy(textDocument: vscode.TextDocument) {
        if(vscode.workspace.getConfiguration('dx-code-companion').autosave.enabled) {
            DeploySource.deployToSFDC(textDocument);
        }
    }

    private static async getServerCopy(metadataName: string, fileName: string, fileextension: string): Promise<ServerResult>  {
        const connection = await Config.getConnection();
        const util = new SalesforceUtil(connection);
        return util.getFileContentFromServer(metadataName,fileName,fileextension);
    }

    private static compare(localfile :string, serverfile: string): boolean {
        if(localfile === serverfile) {
            return true;
        } else {
            return false;
        }
    }

    private static executeDeployCommand(cmd: CommandService): void {
        let activeTerminal = VSCodeCore.setupTerminal();
        if(activeTerminal){
            activeTerminal.sendText(cmd.generateCommand());
        }
    }

    private static isProjectAuthroizedToSFDC() : boolean {
        let isProjectAuthorized: boolean = false;
        if(vscode.workspace.workspaceFolders){
            // The authorization creates sfdx-project.json files and this extension supports only auth done using sfdx cli
            if(fs.existsSync(vscode.workspace.workspaceFolders[0].uri.fsPath + '/sfdx-project.json')) {
                isProjectAuthorized = true;
            } 
        }
        return isProjectAuthorized;
    }

    private static supportedFileForDeploy() : boolean {
        let fileSupported = false;
        if(vscode.window.activeTextEditor) {
            //At this point only few file types are supported for auto save
            const supportedFileTypes = ['trigger','cls','cmp','js','html','evt','css','design','tokens','page','svg','auradoc','component','intf','app','xml'];
            const filePath = vscode.window.activeTextEditor.document.uri.fsPath;
            const pathAsArray = filePath.split('/');
            const lastparam = pathAsArray[pathAsArray.length - 1];
            const fileExtension = lastparam.substring(lastparam.lastIndexOf('.') + 1);
            if(supportedFileTypes.indexOf(fileExtension) !== -1 ){
                fileSupported = true;
            }
        }
        return fileSupported;
    }
}