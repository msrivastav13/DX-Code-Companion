'use strict';

import * as sfcore from '@salesforce/core';
import * as vscode from 'vscode';

export class Config {

    public static async getAllOrgs(): Promise<string[]> {
        const authorizations = await sfcore.AuthInfo.listAllAuthorizations();
        return authorizations.map(a => a.username);
    }

    public static async getAllOrgAliases(): Promise<string[]> {
        const orgAlias: string[] = [];
        const orgs = await this.getAllOrgs();
        const stateAgg = await sfcore.StateAggregator.getInstance();
        for (const org of orgs) {
            const alias = stateAgg.aliases.get(org);
            if (alias) {
                orgAlias.push(alias + ':' + org);
            }
        }
        return orgAlias;
    }

    public static async getConnection(): Promise<any> {
        let defaultusername = await Config.getDefaultUsername();
        const connection = await sfcore.Connection.create({
            authInfo: await sfcore.AuthInfo.create({ username: defaultusername })
        });
        return connection;
    }

    public static async getDefaultUsername() {
        if (vscode.workspace && vscode.workspace.workspaceFolders) {
            const aggregator = await sfcore.ConfigAggregator.create();
            const value = aggregator.getPropertyValue(sfcore.OrgConfigProperties.TARGET_ORG);
            if (!value) { return undefined; }
            const stateAgg = await sfcore.StateAggregator.getInstance();
            return stateAgg.aliases.resolveUsername(String(value));
        }
    }
}
