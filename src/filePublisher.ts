import * as vscode from 'vscode';
import AdmZip from 'adm-zip';
import { TextEncoder } from 'util';
import { DockerFilesMessage } from './models/DockerFilesMessage';
import { handleReceivedDockerContent } from './shared/dockerfiles-receiver';
import { logger } from './shared/logger';
import { registerSetupSubscriber, setupSubscriber, subscribeNode } from './setupSubscriber';
import { pipe } from 'it-pipe';
import map from 'it-map';
import * as lp from 'it-length-prefixed'
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { randomInt } from 'crypto';

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

		let selfNode = subscribeNode;

		// if(!selfNode) {await setupSubscriber(context);}

		let peers = await selfNode.peerStore.all();
		let dockerablePeers = peers.filter(async (p) => {
			let tags = await selfNode.peerStore.getTags(p.id);
			if (tags.filter((t) => t.name === 'dockerable').length > 0) {
				return true;
			} else {
				return false;
			}
		});
		let peer = dockerablePeers[randomInt(dockerablePeers.length)];
		let stream = await selfNode.dialProtocol(peer.id, '/zip');
		pipe(
			stream,
			(source) => {
				return (async function* () {
					for await (const buf of source) { yield uint8ArrayToString(buf.subarray()); }
				})();
			},
			async (source) => {
				for await (const msg of source) {
					console.log("> " + msg);
				}
			}
		);
		pipe(
			[uint8Array],
			stream
		);

		// stream.close();
		// send message to docker machine
		logger().info(`Sent zipped folder: ${ws.name}`);
		vscode.window.showInformationMessage(`Sent zipped folder: ${ws.name}`);

		// await handleReceivedDockerContent(context, uint8Array);

	} else {
		vscode.window.showErrorMessage('Found no applicable workspace folders to work with :(');
	}
}

export function registerFilePublisher(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('p2p-share.sendProjectFiles', async () => await publishFiles(context)));
}