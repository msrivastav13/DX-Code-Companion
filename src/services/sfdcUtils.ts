'use strict';

import {Connection} from '@salesforce/core';
import {ServerResult, Query} from '../typings/ccdxTypings';
import {Metadata} from '../services/findMetadataType';


export class SalesforceUtil {

    private connection: Connection;

    constructor (conn: Connection) {
        this.connection = conn;
    }

    public async getPackages() : Promise<object> {
        const connection = await this.connection;
        return await connection.tooling.query('SELECT Name, NamespacePrefix FROM MetadataPackage');
    }

    public async getNamespace(): Promise<string> {
        let namespacePrefix = '';
        const connection = await this.connection;
        const Organization = await connection.query('Select NamespacePrefix from Organization');
        if(Organization.totalSize > 0){
            const organizationRec = <any> Organization.records[0];
            namespacePrefix = organizationRec['NamespacePrefix'];
        }
        return namespacePrefix;
    }

    public async getFileContentFromServer(metadataType: string, filename: string,fileextension: string): Promise<ServerResult> {
        const namespacePrefix = await this.getNamespace();
        const connection = await this.connection;
        const query = await this.getToolingQuery(metadataType,filename,fileextension,namespacePrefix);
        let serverResponse = {} as ServerResult;
        serverResponse.exist = false;
        const result =  await connection.tooling.query(query.queryString);
        if(result.records.length > 0) {
            const response = <any> result.records[0];
            serverResponse.Body = response[query.bodyfield];
            serverResponse.exist = true;
        }
         
        return serverResponse;
    }

    private async getToolingQuery (metadataType: string, filename: string | null, fileextension: string, namespacePrefix: string): Promise<Query> {
        let bodyfield: string;
        let wherefield: string;
        const query = {} as Query;
        switch(metadataType) { 
            case "ApexClass" || "ApexTrigger": { 
                bodyfield = 'Body';
                wherefield = 'Name';
                break; 
            } 
            case "ApexPage" || "ApexComponent": { 
                bodyfield = 'Markup';
                wherefield = 'Name';
                break; 
            }
            case "AuraDefinition": { 
                const connection = this.connection;
                const auraDefinition = <any> await connection.tooling.sobject('AuraDefinitionBundle').find({
                    DeveloperName: filename,
                    NamespacePrefix: namespacePrefix
                });
                bodyfield = 'Source';
                wherefield = 'AuraDefinitionBundleId';
                metadataType = 'AuraDefinition';
                if(auraDefinition.length > 0){
                    filename = auraDefinition[0].Id;
                } else {
                    filename = null;
                }
                break; 
            }
            case "LightningComponent": { 
                bodyfield = 'Markup';
                wherefield = 'Name';
                break; 
            }   
            default: { 
                bodyfield = 'Body';
                wherefield = 'Name';            
            } 
        }
        query.queryString = `Select ${bodyfield} from ${metadataType}`;
        if(metadataType === 'AuraDefinition') {
            const deftype = Metadata.getDefType(fileextension,filename);
            query.queryString += ` where DefType='${deftype}'`;
            if(filename !== null){
                query.queryString += ` and ${wherefield}='${filename}'`;
            }
        } else {
            query.queryString += ` where ${wherefield}='${filename}'`;
             // Add Namespace Prefix
            if(namespacePrefix !== null) {
                query.queryString += ` and NamespacePrefix=${namespacePrefix}`;
            }
        }
        query.bodyfield = bodyfield;
        return query;
    }

}