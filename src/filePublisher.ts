import * as vscode from 'vscode';
import AdmZip from 'adm-zip';
import { TextEncoder } from 'util';
import { DockerFilesMessage } from './models/DockerFilesMessage';
import { handleReceivedDockerContent } from './shared/dockerfiles-receiver';
import { logger } from './shared/logger';


async function publishFiles(context: vscode.ExtensionContext) {
	logger().info('Sending of projects files has been activated!');
	if (vscode.workspace.workspaceFolders !== undefined) {
		let ws = vscode.workspace.workspaceFolders[0];

		if (vscode.window.activeTextEditor !== undefined) {
			let docuri = vscode.window.activeTextEditor.document.uri;
			let tmpWs = vscode.workspace.getWorkspaceFolder(docuri);
			if (tmpWs !== undefined) {
				ws = tmpWs;
			}
		}

		logger().info(`Begin zipping of folder: ${ws.name}`);
		let wsuri = ws.uri;
		var zip = new AdmZip();
		zip.addLocalFolder(wsuri.fsPath);

		let userId = 'user123';
		let zipName = ws.name;
		let zipBuffer = zip.toBuffer();


		let message = new DockerFilesMessage(userId, zipName, zipBuffer);

		let jsonMsg = JSON.stringify(message);

		let uint8Array = new TextEncoder().encode(jsonMsg);

		// send message to docker machine
		logger().info(`Sent zipped folder: ${ws.name}`);
		vscode.window.showInformationMessage(`Sent zipped folder: ${ws.name}`);

		await handleReceivedDockerContent(context, uint8Array);

	} else {
		vscode.window.showErrorMessage('Found no applicable workspace folders to work with :(');
	}
}

export function registerFilePublisher(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('p2p-share.sendProjectFiles', async () => await publishFiles(context)));
}