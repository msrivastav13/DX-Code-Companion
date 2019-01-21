'use strict';

import {VSCodeCore} from './vscodeCore';
import {VSCodeUI} from './vscodeUI';
import {SalesforceUtil} from './sfdcUtils';
import {QueryResult} from './typings/ccdxTypings';

export class RetrieveSource {

    public static async retrieve(cmd: string): Promise<void> {
        const packages = await SalesforceUtil.getPackages() as QueryResult;
        const pkgs = packages.records.map( pkg => pkg.Name);
        const unmanagedpkg = await VSCodeUI.showQuickPick(pkgs);
        if(unmanagedpkg) {
            let activeTerminal = VSCodeCore.setupTerminal();
            if(activeTerminal){
                let retrievecommand = cmd + '"' + unmanagedpkg + '"';
                activeTerminal.sendText(retrievecommand);
            }
        }
    }
}