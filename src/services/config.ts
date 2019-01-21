'use strict';

import * as sfcore from '@salesforce/core';
import * as vscode from 'vscode';

export class Config {

    private static async getAllOrgs(): Promise<string[]> {
        const authFiles = await sfcore.AuthInfo.listAllAuthFiles();
        const orgs = authFiles.map(authfile => authfile.replace('.json', ''));
        return orgs;
    }

    private static async getAllAliases(): Promise<sfcore.Aliases> {
        const aliases = await sfcore.Aliases.create(sfcore.Aliases.getDefaultOptions());
        return aliases;
    }

    public static async getAllOrgAliases(): Promise<string[]> {
        const orgAlias = [];
        const orgs = await this.getAllOrgs();
        const aliases = await this.getAllAliases();
        // Map the aliases onto the orgs
        for (const org of orgs) {
            if(aliases.getKeysByValue(org)) {
                orgAlias.push( aliases.getKeysByValue(org) + ':' + org );
            }
        }
        return orgAlias;
    }

    public static async getLocalAlias(): Promise<any> {
        if(vscode.workspace.workspaceFolders){
            const rootPath = vscode.workspace.workspaceFolders[0];
            const localusername = await sfcore.fs.readJsonMap(rootPath.uri.fsPath + '/.sfdx/sfdx-config.json');
            return localusername;
        } else {
            return undefined;
        }
    }

    public static async getConnection(): Promise<any> {
        const orgs = await this.getAllOrgs();
        const aliases = await this.getAllAliases();
        const defaultalias = await Config.getLocalAlias();
        let defaultusername ;
        // Should be better way to get the defaultusername .The config aggeragtor does not work currently
        for (const org of orgs) {
            if(aliases.getKeysByValue(org).length>0 && aliases.getKeysByValue(org)[0] === defaultalias.defaultusername) {
                defaultusername = org;
                break ;
            }
        }
        const connection = await sfcore.Connection.create({
            authInfo: await sfcore.AuthInfo.create({ username:  defaultusername})
        });
        return connection;
    }
}
