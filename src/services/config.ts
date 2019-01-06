'use strict';

import * as sfcore from '@salesforce/core';
import * as vscode from 'vscode';

export class Config {

    public static async getAllAliases(): Promise<string[]> {
        const orgAlias : string [] = [];
        const authFiles = await sfcore.AuthInfo.listAllAuthFiles();
        const orgs = authFiles.map(authfile => authfile.replace('.json', ''));
        const aliases = await sfcore.Aliases.create(sfcore.Aliases.getDefaultOptions());
        // Map the aliases onto the orgs
        for (const org of orgs) {
            if(aliases.getKeysByValue(org)) {
                orgAlias.push( aliases.getKeysByValue(org) + ':' + org );
            }
        }
        return orgAlias;
    }

    public static async getLocalUsername(): Promise<any> {
        if(vscode.workspace.workspaceFolders){
            const rootPath = vscode.workspace.workspaceFolders[0];
            const localusername = await sfcore.fs.readJsonMap(rootPath.uri.fsPath + '/.sfdx/sfdx-config.json');
            console.log(localusername);
            return localusername;
        } else {
            return undefined;
        }
    }
}
