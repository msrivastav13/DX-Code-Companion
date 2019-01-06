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

}