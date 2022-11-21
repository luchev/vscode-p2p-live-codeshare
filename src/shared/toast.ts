import * as vscode from 'vscode';


export function toast(message: string, ...items: string[]) {
	vscode.window.showInformationMessage(message, ...items);
}
