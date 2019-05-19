'use strict';

import * as fs from 'fs';
import * as vscode from 'vscode';
import { VSCodeCore } from './vscodeCore';
import {VSCodeUI} from './vscodeUI';

export class Changeset {

    public async retrieve(): Promise<void> { 

        const name: string = await VSCodeUI.showInputBox('Enter changeset name');
        if(vscode.workspace.workspaceFolders){
            const changesetDir = vscode.workspace.workspaceFolders[0].uri.fsPath + '/changesets' ;
            const subDirectory = changesetDir + '/' + name.trim().toLowerCase().replace(/\s/g,'');

            if(!fs.existsSync(changesetDir)) {
                //create changesets directory
                fs.mkdirSync(changesetDir);
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
}