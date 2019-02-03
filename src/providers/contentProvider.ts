import * as vscode from 'vscode';

export default class CodeCompanionContentProvider implements vscode.TextDocumentContentProvider {

    private static instance: CodeCompanionContentProvider;
    public static serverContent: string;
   
    public static getInstance() {
        if(!CodeCompanionContentProvider.instance) {
            this.instance = new CodeCompanionContentProvider();
        }
        return this.instance;
    }

    provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
        return new Promise<string>( async (resolve, reject) => {
            if(CodeCompanionContentProvider.serverContent) {
                resolve(CodeCompanionContentProvider.serverContent);
            }
        });
    }

}