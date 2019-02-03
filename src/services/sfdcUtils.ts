'use strict';

import {Connection} from '@salesforce/core';
import {ServerResult} from '../typings/ccdxTypings';

export class SalesforceUtil {

    private connection: Connection;

    constructor (conn: Connection) {
        this.connection = conn;
    }

    public async getPackages() : Promise<object> {
        const connection = await this.connection;
        return await connection.tooling.query('SELECT Name, NamespacePrefix FROM MetadataPackage');
    }

    public async getNamespace() : Promise<string> {
        let namespacePrefix = '';
        const connection = await this.connection;
        const Organization = await connection.query('Select NamespacePrefix from Organization');
        if(Organization.totalSize > 0){
            const organizationRec = <any> Organization.records[0];
            namespacePrefix = organizationRec['NamespacePrefix'];
        }
        return namespacePrefix;
    }

    public async getFileContentFromServer(metadataType: string, filename: string) : Promise<ServerResult> {
        const namespacePrefix = await this.getNamespace();
        const connection = await this.connection;
        const apexclass = <any> await connection.tooling.sobject('Apexclass').find({
            Name: filename,
            NameSpacePrefix : namespacePrefix
        });

        const serverResponse = {} as ServerResult;

       if(apexclass !== null){
            const apexBody = apexclass[0];
            serverResponse.Body = apexBody['Body'];
            serverResponse.lastModifiedDate = apexBody['LastModifiedDate'];
       } 
       return serverResponse;
    }

}