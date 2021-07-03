"use strict";

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import CodeCompanionContentProvider from "../providers/ccprovider";
import { ServerResult } from "../typings/ccdxTypings";
import { CommandService } from "./commandBuilder";
import { Config } from "./config";
import { SalesforceUtil } from "./sfdcUtils";
import { VSCodeCore } from "./vscodeCore";
import { OSUtil } from "./osUtils";
import { VSCodeUI } from "./vscodeUI";

export class DeploySource {
  private static lastSavedToServer: string;

  public static async compareWithServer(textDocument: vscode.TextDocument) {
    if (this.supportedFileForDeploy()) {
      // The authorization creates sfdx-project.json files and this extension supports only auth done using sfdx cli
      if (this.isProjectAuthroizedToSFDC()) {
        if (vscode.window.activeTextEditor) {
          const {
            commandToExecute,
            filename,
            fileextension
          } = DeploySource.extractInfo(textDocument);
          const metadataType = commandToExecute.metadataDef.getMetadataType()
            .MetadataName;
          const serverResponse = await this.getServerCopy(
            metadataType,
            filename,
            fileextension
          );
          if (serverResponse.exist) {
            // Set content provider content
            CodeCompanionContentProvider.serverContent = serverResponse.Body;
            var sfuri: vscode.Uri = vscode.Uri.parse(
              `codecompanion://salesforce.com/${metadataType}/${filename}.${fileextension}?${Date.now()}`
            );
            vscode.commands.executeCommand(
              "vscode.diff",
              sfuri,
              textDocument.uri,
              `${filename}.${fileextension}(SERVER) <~> ${filename}.${fileextension} (LOCAL)`,
              { preview: false }
            );
          }
        }
      }
    }
  }

  public static deployToSFDC(textDocument: vscode.TextDocument) {
    if (this.supportedFileForDeploy()) {
      // The authorization creates sfdx-project.json files and this extension supports only auth done using sfdx cli
      if (this.isProjectAuthroizedToSFDC()) {
        if (vscode.window.activeTextEditor) {
          const {
            commandToExecute,
            filename,
            fileextension
          } = DeploySource.extractInfo(textDocument);
          if (
            vscode.workspace.getConfiguration("dx-code-companion")
              .manageconflict.enabled
          ) {
            const metadataType = commandToExecute.metadataDef.getMetadataType()
              .MetadataName;
            this.save(
              metadataType,
              filename,
              textDocument,
              commandToExecute,
              fileextension
            );
          } else {
            this.executeDeployCommand(commandToExecute);
          }
        }
      } else {
        vscode.window.showErrorMessage("Authorize a salesforce org");
      }
    }
  }

  private static extractInfo(textDocument: vscode.TextDocument) {
    const filepath = VSCodeCore.getFsPath();
    const filepathArray = path.basename(textDocument.fileName).split(".");
    const filename = filepathArray[0];
    let fileextension = filepathArray[1];
    if (filepathArray.length > 2) {
      fileextension = fileextension + "." + filepathArray[2];
    }
    const commandToExecute = new CommandService(filepath);
    return { commandToExecute, filename, fileextension };
  }

  private static save(
    metadataType: string,
    filename: string,
    textDocument: vscode.TextDocument,
    commandToExecute: CommandService,
    fileextension: string
  ) {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Comparing with server copy"
      },
      () => {
        var p = new Promise<void>(async resolve => {
          const serverResponse = await this.getServerCopy(
            metadataType,
            filename,
            fileextension
          );
          if (serverResponse.exist) {
            // Set content provider content
            CodeCompanionContentProvider.serverContent = serverResponse.Body;
            if (
              !this.compare(textDocument.getText(), serverResponse.Body) &&
              !this.compare(serverResponse.Body, this.lastSavedToServer)
            ) {
              var sfuri: vscode.Uri = vscode.Uri.parse(
                `codecompanion://salesforce.com/${metadataType}/${filename}?${Date.now()}`
              );
              vscode.commands.executeCommand(
                "vscode.diff",
                sfuri,
                textDocument.uri,
                `${filename}.${fileextension}(SERVER) <~> ${filename}.${fileextension} (LOCAL)`,
                { preview: true }
              );
              vscode.window
                .showWarningMessage(
                  "File has been modified in salesforce",
                  "Refresh From Server",
                  "Overwrite Server Copy"
                )
                .then(s => {
                  if (s === "Overwrite Server Copy") {
                    this.run(commandToExecute, textDocument);
                  } else if (s === "Refresh From Server") {
                    this.refresh(serverResponse.Body);
                  }
                });
            } else {
              this.run(commandToExecute, textDocument);
            }
          } else {
            this.run(commandToExecute, textDocument);
          }
          resolve();
        });
        return p;
      }
    );
  }

  public static async refreshFromServer(textDocument: vscode.TextDocument) {
    if (this.supportedFileForDeploy()) {
      // The authorization creates sfdx-project.json files and this extension supports only auth done using sfdx cli
      if (this.isProjectAuthroizedToSFDC()) {
        if (vscode.window.activeTextEditor) {
          const {
            commandToExecute,
            filename,
            fileextension
          } = DeploySource.extractInfo(textDocument);
          const metadataType = commandToExecute.metadataDef.getMetadataType()
            .MetadataName;
          vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: "Refreshing.."
            },
            () => {
              var p = new Promise<void>(async resolve => {
                const serverResponse = await this.getServerCopy(
                  metadataType,
                  filename,
                  fileextension
                );
                this.refresh(serverResponse.Body);
                resolve();
              });
              return p;
            }
          );
        }
      }
    }
  }

  private static run(
    commandToExecute: CommandService,
    textDocument: vscode.TextDocument
  ) {
    this.lastSavedToServer = textDocument.getText();
    this.executeDeployCommand(commandToExecute);
  }

  private static refresh(filecontent: string) {
    this.lastSavedToServer = filecontent;
    fs.writeFileSync(VSCodeCore.getFsPath(), filecontent);
  }

  public static deploy(textDocument: vscode.TextDocument) {
    if (
      vscode.workspace.getConfiguration("dx-code-companion").autosave.enabled
    ) {
      DeploySource.deployToSFDC(textDocument);
    }
  }

  private static async getServerCopy(
    metadataName: string,
    fileName: string,
    fileextension: string
  ): Promise<ServerResult> {
    const connection = await Config.getConnection();
    const util = new SalesforceUtil(connection);
    return util.getFileContentFromServer(metadataName, fileName, fileextension);
  }

  private static compare(localfile: string, serverfile: string): boolean {
    if (localfile === serverfile) {
      return true;
    } else {
      return false;
    }
  }

  private static executeDeployCommand(cmd: CommandService): void {
    let activeTerminal = VSCodeCore.setupTerminal();
    if (activeTerminal) {
      activeTerminal.sendText(cmd.generateCommand());
    }
  }

  private static isProjectAuthroizedToSFDC(): boolean {
    let isProjectAuthorized: boolean = false;
    if (vscode.workspace.workspaceFolders) {
      // The authorization creates sfdx-project.json files and this extension supports only auth done using sfdx cli
      if (
        fs.existsSync(
          vscode.workspace.workspaceFolders[0].uri.fsPath + "/sfdx-project.json"
        )
      ) {
        isProjectAuthorized = true;
      }
    }
    return isProjectAuthorized;
  }

  private static supportedFileForDeploy(): boolean {
    let fileSupported = false;
    if (vscode.window.activeTextEditor) {
      const filePath = vscode.window.activeTextEditor.document.uri.fsPath;
      const resourcefoldername = vscode.workspace.getConfiguration(
        "dx-code-companion"
      ).staticresourcefolder.resourceBundleFoldername;
      // Check if this is a static resource
      if (
        filePath.indexOf("/" + resourcefoldername + "/") !== -1 ||
        filePath.indexOf("\\" + resourcefoldername + "\\") !== -1
      ) {
        fileSupported = true;
      } else {
        //At this point only few file types are supported for auto save
        const supportedFileTypes = [
          "trigger",
          "cls",
          "cmp",
          "evt",
          "design",
          "tokens",
          "page",
          "svg",
          "auradoc",
          "component",
          "intf",
          "app"
        ];
        const pathAsArray = filePath.split("/");
        const lastparam = pathAsArray[pathAsArray.length - 1];
        const fileExtension = lastparam.substring(
          lastparam.lastIndexOf(".") + 1
        );
        const directory = path.basename(path.dirname(path.dirname(filePath)));
        if (
          fileExtension === "js" ||
          fileExtension === "css" ||
          fileExtension === "html"
        ) {
          // check for immediate directory
          if (directory === "lwc" || directory === "aura") {
            fileSupported = true;
          }
        }
        if (supportedFileTypes.indexOf(fileExtension) !== -1) {
          fileSupported = true;
        }
      }
    }
    return fileSupported;
  }

  public static async deploySrc(uripath: string): Promise<void> {
    if (vscode.workspace.workspaceFolders) {
      let activeTerminal = VSCodeCore.setupTerminal();
      let deployCommand =
        "sfdx force:mdapi:deploy -d " + OSUtil.toUnixStyle(uripath) + " -w -1";
      let runCommand = true;
      if (uripath.indexOf("changesets") > -1) {
        //changesets folder so ask for relevant org
        try {
          const orgs = fs.readFileSync(
            vscode.workspace.workspaceFolders[0].uri.fsPath +
              "/changesets/orgs.json"
          );
          const username = await VSCodeUI.showQuickPick(
            JSON.parse(orgs.toString()),
            "Select Org for deployment(To display more orgs add usernames in orgs.json)"
          );
          deployCommand = deployCommand + " -u " + username;
          if (!username) {
            runCommand = false;
          }
        } catch (error) {
          throw error;
        }
      }
      if (activeTerminal && runCommand) {
        activeTerminal.sendText(deployCommand);
      }
    }
  }
}
