'use strict';

import {Connection} from '@salesforce/core';
import {VSCodeCore} from './vscodeCore';
import {VSCodeUI} from './vscodeUI';
import {SalesforceUtil} from './sfdcUtils';
import {QueryResult} from '../typings/ccdxTypings';

export class RetrieveSource {

    private connection: Connection;

    constructor (conn: Connection) {
        this.connection = conn;
    }

    public async retrieve(cmd: string): Promise<void> {
        const sfdcUtil = new SalesforceUtil(this.connection);
        const packages = await sfdcUtil.getPackages() as QueryResult;
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