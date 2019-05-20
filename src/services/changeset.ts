'use strict';

import * as fs from 'fs';
import * as vscode from 'vscode';
import {Config} from './config';
import { VSCodeCore } from './vscodeCore';
import {VSCodeUI} from './vscodeUI';

export class Changeset {

    public async retrieve(): Promise<void> { 

        const name: string = await VSCodeUI.showInputBox('Enter changeset name');
        if(vscode.workspace.workspaceFolders){
            const changesetDir = vscode.workspace.workspaceFolders[0].uri.fsPath + '/changesets' ;
            const subDirectory = changesetDir + '/' + name.trim().toLowerCase().replace(/\s/g,'');
            const orgsJson = vscode.workspace.workspaceFolders[0].uri.fsPath + '/changesets/orgs.json'; 

            if(!fs.existsSync(changesetDir)) {
                //create changesets directory
                fs.mkdirSync(changesetDir);
                const defaultorg = await Config.getDefaultUsername();
                const orgArray: Array<string | undefined> = [defaultorg];
                await fs.writeFile(orgsJson,JSON.stringify(orgArray), 'UTF-8', (err) => {
                    if (err) {
                        throw err;
                    }
                });
            } 
            if(!fs.existsSync(subDirectory)) {
                fs.mkdirSync(subDirectory);
            }
            let activeTerminal = VSCodeCore.setupTerminal();
            if(activeTerminal){
                //let retrievecommand = 'sfdx force:mdapi:retrieve -s -p ' + '"' + name + '"' + ' -r ' + subDirectory + ' -w 30 --json';
                let retrievecommand = 'sfdx retrieve:pkgsource -n ' + '"' + name + '"' + ' -r ' + 'changesets/' + name.trim().toLowerCase().replace(/\s/g,'') + '/src';
                activeTerminal.sendText(retrievecommand);
            } 
        }
    }

    public async addOrgs() : Promise<void> { 
        if(vscode.workspace.workspaceFolders){
            const orgsJson = vscode.workspace.workspaceFolders[0].uri.fsPath + '/changesets/orgs.json'; 
            await fs.readFile(orgsJson, async (err, currentorgs) => {
                if (err) {
                    throw err;
                }
                if(currentorgs) {
                    const currentOrgsArray : string[] = JSON.parse(currentorgs.toString());
                    let allOrgsListArray = await Config.getAllOrgs();
                    allOrgsListArray = allOrgsListArray.filter((el) => !currentOrgsArray.includes(el));
                    const selectedOrgs = await VSCodeUI.showQuickPickMultiple(allOrgsListArray);
                    if(selectedOrgs) {
                        currentOrgsArray.push.apply(currentOrgsArray, selectedOrgs);
                        await fs.writeFile(orgsJson,JSON.stringify(currentOrgsArray), 'UTF-8', (err) => {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                }
            });
        }
    }
}