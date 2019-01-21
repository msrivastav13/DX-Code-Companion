'use strict';

import * as vscode from 'vscode';

export class VSCodeUI {

    public static async showInputBox(placeholder: string): Promise<any> {
        const result = await vscode.window.showInputBox({
            ignoreFocusOut : true,
            value: undefined,
            valueSelection: [2, 4],
            placeHolder: placeholder,
            prompt: placeholder
        });
        return result;
    }

    public static async showQuickPick(options: string[], placeholder?:string ){
        const result = await vscode.window.showQuickPick(options, {
            placeHolder: placeholder,
            ignoreFocusOut : true
        });
        return result;
    }

}