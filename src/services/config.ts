'use strict';

import * as sfcore from '@salesforce/core';
import * as vscode from 'vscode';
import * as path from 'path';

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

    public static async getConnection(): Promise<any> {
        if(vscode.workspace && vscode.workspace.workspaceFolders) {
            const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            const myLocalConfig = await sfcore.ConfigFile.create({
                isGlobal: false,
                rootFolder: path.join(rootPath, '.sfdx'),
                filename: 'sfdx-config.json'
            });
            const localValue = myLocalConfig.get('defaultusername');
            let defaultusername = await sfcore.Aliases.fetch(JSON.stringify(localValue).replace(/\"/g, ''));
            const connection = await sfcore.Connection.create({
                authInfo: await sfcore.AuthInfo.create({ username:  defaultusername})
            });
            return connection;
        } else {
            throw vscode.FileSystemError.FileNotFound('Project does not have workspace opened');
        }      
    }
}
