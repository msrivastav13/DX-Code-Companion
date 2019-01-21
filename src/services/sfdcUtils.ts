'use strict';

import {Config} from './config';

export class SalesforceUtil {

    public static async getPackages() : Promise<object> {
        const connection = await Config.getConnection();
        return await connection.tooling.query('SELECT Name, NamespacePrefix FROM MetadataPackage');
    }

}