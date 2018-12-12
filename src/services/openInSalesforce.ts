'use strict';

import * as path from 'path';
import * as vscode from 'vscode';


export class NavigationService {

    public static metadataCoverageReport() {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://developer.salesforce.com/docs/metadata-coverage'));
    }

    public static componentLibrary() {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://developer.salesforce.com/docs/component-library'));
    }

    public static openVFPage(filePath: string) {
        let fileName = path.basename(filePath);
        fileName = fileName.replace('.page','');
        return fileName;
    }
}