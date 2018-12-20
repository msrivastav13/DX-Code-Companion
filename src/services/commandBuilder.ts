'use strict';

import * as path from 'path';

export class CommandService {

    protected filepath: string; 
    protected directory: string;

    constructor(filepath: string) {
        this.filepath = filepath;
        this.directory = path.basename(path.dirname(path.dirname(this.filepath)));
    }

    public generateCommand() {
       let command = 'sfdx deploy:' ;
       const auraFiles = ['.cmp','.app','.evt','.css','.js','design','svg','tokens','intf','auradoc'];
       if(this.filepath.includes('.cls')){
            command = command + 'apex ';
       } else if(this.filepath.includes('.trigger')) {
          command = command + 'trigger ';
       } else if (this.filepath.includes('.page')){
          command = command + 'vf ';
       } else if (this.filepath.includes('.component')){
          command = command + 'vfcomponent ';
       } else if (auraFiles.some( file=> this.filepath.indexOf(file) >=0) && this.directory === 'aura'){
          command = command + 'aura ';
       } else if (this.directory === 'lwc'){
         command = command + 'lwc ';
       } else {
          command = '';
       }
       command = command + '-p ' + '"' + this.filepath + '"';
       return command;
    }
}