"use strict";

import * as path from "path";
import { Metadata } from "../services/findMetadataType";
import { workspace } from "vscode";

export class CommandService {
  protected filepath: string;
  protected directory: string;
  public metadataDef: Metadata;

  constructor(filepath: string) {
    this.filepath = filepath;
    this.directory = path.basename(path.dirname(path.dirname(this.filepath)));
    this.metadataDef = new Metadata(this.filepath);
  }

  public generateCommand() {
    let command = "sfdx deploy:";
    const metadata = this.metadataDef;
    // const auraFiles = ['.cmp','.app','.evt','.css','.js','design','svg','tokens','intf','auradoc'];
    command = command + metadata.getMetadataType().CommandName + " ";
    command = command + "-p " + '"' + this.filepath + '"';
    if (this.metadataDef.getMetadataType().CommandName === "staticresource") {
      command =
        command +
        " -r " +
        workspace.getConfiguration("dx-code-companion").staticresourcefolder
          .resourceBundleFoldername;
    }
    return command;
  }
}
