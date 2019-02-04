'use strict';

import { Config } from './config';
import { VSCodeCore } from './vscodeCore';
import { VSCodeUI } from './vscodeUI';

export async function switchOrg(): Promise<void> {
    const orgs = await Config.getAllOrgAliases();
    const result = await VSCodeUI.showQuickPick(orgs);
    let cmd = 'sfdx force:config:set defaultusername=';
    if(result){
        cmd = cmd + result.split(':')[0];
        let activeTerminal = VSCodeCore.setupTerminal();
        if(activeTerminal){
            activeTerminal.sendText(cmd);
        }
    }
}