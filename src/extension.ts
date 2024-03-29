// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path = require('path');
import * as vscode from 'vscode';
import { getVsCodeConfig } from './services/config';

function getCurrentDateString(): string {
    let date = new Date();
    return date.getFullYear().toString().padStart(4, '0') + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
}

function getDailyUri(dateString: string): vscode.Uri {
    const dailyNoteDirectory = vscode.Uri.file(getVsCodeConfig<string>('createDaily.directory', '.'));
    const dailyNoteFilename = dateString + '.md';
    if (path.posix.isAbsolute(dailyNoteDirectory.fsPath)) {
        return vscode.Uri.joinPath(dailyNoteDirectory, dailyNoteFilename);
    } else {
        return vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri,
            dailyNoteDirectory.fsPath, dailyNoteFilename);
    }
}

function getMeetingUri(dateString: string, meetingName: string): vscode.Uri {
    let meetingNameFileFriendly = meetingName.split(' ').join('-');
    const meetingNoteDirectory = vscode.Uri.file(getVsCodeConfig<string>('createMeeting.directory', '.'));
    const meetingNoteFilename = dateString + '-' + meetingNameFileFriendly + '.md';
    if (path.posix.isAbsolute(meetingNoteDirectory.fsPath)) {
        return vscode.Uri.joinPath(meetingNoteDirectory, meetingNoteFilename);
    } else {
        return vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri,
            meetingNoteDirectory.fsPath, meetingNoteFilename);
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('"markdown-log-utils" is now active');

	context.subscriptions.push(vscode.commands.registerCommand('markdown-log-utils.createDaily', async () => {
        let edit = new vscode.WorkspaceEdit();
        let dateString = getCurrentDateString();
        let uri = getDailyUri(dateString);
        edit.createFile(uri, { ignoreIfExists: true });
        let created = await vscode.workspace.applyEdit(edit);
        if (created) {
            let doc = await vscode.workspace.openTextDocument(uri);
            let editor = await vscode.window.showTextDocument(doc);
            if(doc.getText() === '') {
                let dow = new Date().toLocaleString('en-us', {  weekday: 'long' });
                editor.edit(editBuilder => {
                    editBuilder.insert(doc.positionAt(0), '# ' + dateString + ' (' + dow + ')\n');
                });
            }
        }
	}));

	context.subscriptions.push(vscode.commands.registerCommand('markdown-log-utils.createMeeting', async () => {
        let meetingName = await vscode.window.showInputBox({ title: 'Meeting name' });
        if (meetingName) {
            let edit = new vscode.WorkspaceEdit();
            let dateString = getCurrentDateString();
            let uri = getMeetingUri(dateString, meetingName);
            edit.createFile(uri, { ignoreIfExists: true });
            let created = await vscode.workspace.applyEdit(edit);
            if (created) {
                // create header for the meeting file
                let doc = await vscode.workspace.openTextDocument(uri);
                let editor = await vscode.window.showTextDocument(doc);
                if(doc.getText() === '') {
                    editor.edit(editBuilder => {
                        editBuilder.insert(doc.positionAt(0), '# ' + meetingName + ' (' + dateString + ')\n');
                    });
                }

                // insert link to the meeting in the daily log file
                let dailyUri = getDailyUri(dateString);
                let dailyDoc = await vscode.workspace.openTextDocument(dailyUri);
                let dailyEditor = await vscode.window.showTextDocument(dailyDoc, undefined, true);
                let relPath = path.relative(path.dirname(dailyUri.fsPath), uri.fsPath);
                if (path.sep === '\\') {
                    relPath = relPath.split(path.sep).join('/');
                }
                let refToMeeting = '[' + meetingName + '](' + relPath + ')\n';
                dailyEditor.edit(editBuilder => {
                    editBuilder.replace(dailyEditor.selection, refToMeeting);
                });
            }
        }
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
