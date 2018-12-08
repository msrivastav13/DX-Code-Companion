'use strict';

export class CommandService {

    protected path: string; 

    constructor(path: string) {
        this.path = path;
    }

    public generateCommand() {
       let command = 'sfdx deploy:' ;
       const auraFiles = ['.cmp','.app','.evt','.css','.js','design','svg','tokens','intf','auradoc'];
       if(this.path.includes('.cls')){
            command = command + 'apex ';
       } else if(this.path.includes('.trigger')) {
          command = command + 'trigger ';
       } else if (this.path.includes('.page')){
          command = command + 'vf ';
       } else if (this.path.includes('.component')){
          command = command + 'vfcomponent ';
       } else if (auraFiles.some( file=> this.path.indexOf(file) >=0)){
          command = command + 'aura ';
       } else {
          command = '';
       }
       command = command + '-p ' + '"' + this.path + '"';
       return command;
    }
}