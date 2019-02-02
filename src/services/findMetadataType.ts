'use strict';

import * as path from 'path';
import {MetadataType} from '../typings/ccdxTypings';

export class Metadata {

    protected filepath: string; 
    protected directory: string;

    constructor(filepath: string) {
        this.filepath = filepath;
        this.directory = path.basename(path.dirname(path.dirname(this.filepath)));
    }

    public getMetadataType(): MetadataType {
        const metadataType = {} as MetadataType;
        // const auraFiles = ['.cmp','.app','.evt','.css','.js','design','svg','tokens','intf','auradoc'];
        if(this.filepath.includes('.cls')){
            metadataType.MetadataName = 'ApexClass';
            metadataType.CommandName = 'apex';
        } else if(this.filepath.includes('.trigger')) {
            metadataType.MetadataName = 'ApexTrigger';
            metadataType.CommandName = 'trigger';
        } else if (this.filepath.includes('.page')){
            metadataType.MetadataName = 'ApexPage';
            metadataType.CommandName = 'vf';
        } else if (this.filepath.includes('.component')){
            metadataType.MetadataName = 'ApexComponent';
            metadataType.CommandName = 'vfcomponent';
        } else if (this.directory === 'aura'){
            metadataType.MetadataName = 'AuraDefinition';
            metadataType.CommandName = 'aura';
        } else if (this.directory === 'lwc'){
            metadataType.MetadataName = 'LightningComponent';
            metadataType.CommandName = 'lwc';
        } else {
            // Modify this to add support for other Metadata Types
            metadataType.MetadataName = 'unknown';
            metadataType.CommandName = 'unknown';
        }
        return metadataType;
    }
}