// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('"markdown-log-utils" is now active');

	context.subscriptions.push(vscode.commands.registerCommand('markdown-log-utils.createDaily', async () => {
        let edit = new vscode.WorkspaceEdit();
        let date = new Date();
        let dateString = date.getFullYear().toString().padStart(4, '0') + '-' + date.getMonth().toString().padStart(2, '0') + '-' + date.getDay().toString().padStart(2, '0');
        let uri = vscode.Uri.file(vscode.workspace.workspaceFolders![0].uri.fsPath + '/daily/' + dateString + '.md');
        edit.createFile(uri, { ignoreIfExists: true });
        let created = await vscode.workspace.applyEdit(edit);
        if (created) {
            let doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc);
        }
	}));

	context.subscriptions.push(vscode.commands.registerCommand('markdown-log-utils.createMeeting', async () => {
        let meetingName = await vscode.window.showInputBox({ title: 'Meeting name' });
        if (meetingName) {
            let edit = new vscode.WorkspaceEdit();
            let date = new Date();
            let dateString = date.getFullYear().toString().padStart(4, '0') + '-' + date.getMonth().toString().padStart(2, '0') + '-' + date.getDay().toString().padStart(2, '0');
            let uri = vscode.Uri.file(vscode.workspace.workspaceFolders![0].uri.fsPath + '/meetings/' + dateString + '-' + meetingName + '.md');
            edit.createFile(uri, { ignoreIfExists: true });
            let created = await vscode.workspace.applyEdit(edit);
            if (created) {
                let doc = await vscode.workspace.openTextDocument(uri);
                await vscode.window.showTextDocument(doc);
            }
        }
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
