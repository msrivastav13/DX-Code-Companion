'use strict';

import {VSCodeCore} from './vscodeCore';
import {VSCodeUI} from './vscodeUI';

export class RetrieveSource {

    public static async retrieve(cmd: string): Promise<void> {
        const unmanagedpkg = await VSCodeUI.showInputBox('Enter Package Name');
        if(unmanagedpkg) {
            let activeTerminal = VSCodeCore.setupTerminal();
            if(activeTerminal){
                let retrievecommand = cmd + '"' + unmanagedpkg + '"';
                activeTerminal.sendText(retrievecommand);
            }
        }
    }
}