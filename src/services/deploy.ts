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

    public static serverSavedTimestamp:string ;

    public static deployToSFDC(textDocument: vscode.TextDocument) {
        if(this.supportedFileForDeploy()) {
            // The authorization creates sfdx-project.json files and this extension supports only auth done using sfdx cli
            if(this.isProjectAuthroizedToSFDC()) {
                if(vscode.window.activeTextEditor) {
                    const filepath = VSCodeCore.getFsPath();
                    const filename = path.basename(textDocument.fileName).split('.')[0];
                    const commandToExecute = new CommandService(filepath);
                    const metadataType = commandToExecute.metadataDef.getMetadataType().MetadataName;
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "Comparing with file on server",
                    }, () => {
                        var p = new Promise( async (resolve) => {
                            const serverBody = await this.getServerBody(metadataType,filename);
                            // Set content provider content
                            CodeCompanionContentProvider.serverContent = serverBody.Body;
                            if(!this.compare(textDocument.getText(),serverBody.Body)) {
                                if(DeploySource.serverSavedTimestamp !== serverBody.lastModifiedDate) {
                                    DeploySource.serverSavedTimestamp = serverBody.lastModifiedDate;
                                    var sfuri: vscode.Uri = vscode.Uri.parse(`codecompanion://salesforce.com/${metadataType}/${filename}?${Date.now()}`);
                                    vscode.commands.executeCommand('vscode.diff',sfuri,textDocument.uri,`${filename}(SERVER) <~> ${filename} (LOCAL)`,{preview:false});
                                    vscode.window.showWarningMessage('File has been modified in salesforce', 'Refresh From Server', 'Overwrite', 'Cancel').then(s => {
                                        if (s === 'Overwrite') {
                                            this.executeDeployCommand(commandToExecute);
                                        }
                                    });
                                } else {
                                    this.executeDeployCommand(commandToExecute);
                                }
                            } 
                            resolve();
                        });
                        return p;
                    });
                }
            } else {
                vscode.window.showErrorMessage('Authorize a salesforce org');
            }
        }
    }

    public static deploy(textDocument: vscode.TextDocument) {
        if(vscode.workspace.getConfiguration('dx-code-companion').autosave.enabled) {
            DeploySource.deployToSFDC(textDocument);
        }
    }

    static async getServerBody(metadataName: string, fileName: string): Promise<ServerResult>  {
        const connection = await Config.getConnection();
        const util = new SalesforceUtil(connection);
        return util.getFileContentFromServer(metadataName,fileName);
    }

    static compare(localfile :string, serverfile: string): boolean {
        if(localfile === serverfile) {
            return true;
        } else {
            return false;
        }
    }

    static executeDeployCommand(cmd: CommandService): void {
        let activeTerminal = VSCodeCore.setupTerminal();
        if(activeTerminal){
            activeTerminal.sendText(cmd.generateCommand());
        }
    }

    static isProjectAuthroizedToSFDC() : boolean {
        let isProjectAuthorized: boolean = false;
        if(vscode.workspace.workspaceFolders){
            // The authorization creates sfdx-project.json files and this extension supports only auth done using sfdx cli
            if(fs.existsSync(vscode.workspace.workspaceFolders[0].uri.fsPath + '/sfdx-project.json')) {
                isProjectAuthorized = true;
            } 
        }
        return isProjectAuthorized;
    }

    static supportedFileForDeploy() : boolean {
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