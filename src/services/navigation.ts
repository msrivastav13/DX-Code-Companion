'use strict';

import * as path from 'path';
import * as vscode from 'vscode';


export class NavigationService {

    public static metadataCoverageReport() {
        NavigationService.vscodeOpenurl('https://developer.salesforce.com/docs/metadata-coverage');
    }

    public static componentLibrary() {
        NavigationService.vscodeOpenurl('https://developer.salesforce.com/docs/component-library');
    }

    public static openSLDSDocument() {
        NavigationService.vscodeOpenurl('https://www.lightningdesignsystem.com/');
    }

    public static vscodeOpenurl(url: string) {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
    }

    public static openVFPage(filePath: string) {
        let fileName = path.basename(filePath);
        fileName = fileName.replace('.page','');
        return fileName;
    }
}