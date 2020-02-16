'use strict';

import { Connection } from '@salesforce/core';
import { Metadata } from '../services/findMetadataType';
import { Query, ServerResult } from '../typings/ccdxTypings';


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
        let lwcpath: string = '';
        let auraDefId: string | null = '';
        let lwcDefId: string | null = '';
        let componentName: string | null = '';
        const query = {} as Query;
        switch(metadataType) { 
            case "ApexClass": { 
                bodyfield = 'Body';
                wherefield = 'Name';
                break; 
            }
            case "ApexTrigger": { 
                bodyfield = 'Body';
                wherefield = 'Name';
                break; 
            }
            case "ApexComponent": { 
                bodyfield = 'Markup';
                wherefield = 'Name';
                break; 
            } 
            case "ApexPage": { 
                bodyfield = 'Markup';
                wherefield = 'Name';
                break; 
            }
            case "AuraDefinition": { 
                if( filename !== null && (filename.endsWith('Helper') || filename.endsWith('Controller'))) {
                    componentName = filename.replace('Helper' ,'');
                    componentName = componentName.replace('Controller' ,'');
                } else {
                    componentName = filename;
                }
                const auraDefinition = await this.getDefinition(componentName, namespacePrefix, 'AuraDefinitionBundle');
                bodyfield = 'Source';
                wherefield = 'AuraDefinitionBundleId';
                metadataType = 'AuraDefinition';
                auraDefId = this.getDefId(auraDefinition, auraDefId);
                break; 
            }
            case "LightningComponent": { 
                lwcpath = this.getlwcPath(filename, fileextension);
                const lwcDefinition = await this.getDefinition(filename, namespacePrefix, 'LightningComponentBundle');
                bodyfield = 'Source';
                wherefield = 'LightningComponentBundleId';
                metadataType = 'LightningComponentResource';
                lwcDefId = this.getDefId(lwcDefinition, lwcDefId);
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
                query.queryString += ` and ${wherefield}='${auraDefId}'`;
            }
        } else if(metadataType === 'LightningComponentResource') {
            query.queryString += ` where FilePath='${lwcpath}'`;
            if(filename !== null){
                query.queryString += ` and ${wherefield}='${lwcDefId}'`;
            }
        } else {
            query.queryString += ` where ${wherefield}='${filename}'`;
             // Add Namespace Prefix
            if(namespacePrefix !== null) {
                query.queryString += ` and NamespacePrefix=${namespacePrefix}`;
            } else {
                query.queryString += ` and NamespacePrefix=null`;
            }
        }
        query.bodyfield = bodyfield;
        return query;
    }


    private getlwcPath(filename: string | null, fileextension: string): string {
        let lwcpath: string;
        lwcpath = 'lwc/' + filename + '/' + filename + '.' + fileextension;
        return lwcpath;
    }

    private getDefId(definition: any, filename: string | null) {
        if (definition.length > 0) {
            filename = definition[0].Id;
        }
        else {
            filename = null;
        }
        return filename;
    }

    private async getDefinition(filename: string | null, namespacePrefix: string, typename: string) {
        const connection = this.connection;
        const definition = <any>await connection.tooling.sobject(typename).find({
            DeveloperName: filename,
            NamespacePrefix: namespacePrefix
        });
        return definition;
    }
}