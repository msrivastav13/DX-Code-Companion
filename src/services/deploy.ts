'use strict';

import * as vscode from 'vscode';
import {CommandService} from './commandBuilder';
import {VSCodeCore} from './vscodeCore';

export class DeploySource {

    public static deploy() {
        let activeTerminal = VSCodeCore.setupTerminal();
        if(activeTerminal){
            if(vscode.window.activeTextEditor){
                let path = VSCodeCore.getFsPath();
                const commandToExecute = new CommandService(path);
                activeTerminal.sendText(commandToExecute.generateCommand());
            }
        }
    }
}