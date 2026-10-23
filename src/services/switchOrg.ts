'use strict';

import { Config } from './config';
import { VSCodeCore } from './vscodeCore';
import { VSCodeUI } from './vscodeUI';

export async function switchOrg(): Promise<void> {
    const orgs = await Config.getAllOrgAliases();
    const result = await VSCodeUI.showQuickPick(orgs);
    if(result){
        VSCodeCore.runCommand(() => 'sf config set target-org=' + VSCodeCore.quoteArg(result.split(':')[0]));
    }
}