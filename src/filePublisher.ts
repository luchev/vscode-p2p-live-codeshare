import * as vscode from 'vscode';
import AdmZip from 'adm-zip';
import { CommandMessage, DestroyContainerMessage, DockerFilesMessage } from './models/DockerFilesMessage';
import { logger } from './shared/logger';
import { pipe } from 'it-pipe';
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { randomInt } from 'crypto';
import { pushable, Pushable } from 'it-pushable';
import { peer } from './shared/state/peer';
import { Peer } from '@libp2p/interface-peer-store';

async function publishFiles(context: vscode.ExtensionContext) {
	logger().info('Sending of projects files has been activated!');
	if (vscode.workspace.workspaceFolders !== undefined) {
		let selfNode = await peer().p2p();
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

		let userId = peer().peerName();
		let zipName = ws.name;
		let zipBuffer = zip.toBuffer();

		let message = new DockerFilesMessage(userId, zipName, zipBuffer);

		let jsonMsg = JSON.stringify(message);

		let peers = await selfNode.peerStore.all();

		const dockerablePeers = await filter(peers, async (p: Peer) => {
			let tags = await selfNode.peerStore.getTags(p.id);
			let dockerTags = tags.filter((t) => t.name === 'dockerable');
			if (dockerTags.length > 0) {
				return true;
			} else {
				return false;
			}
		});

		let dockerablePeer = dockerablePeers[randomInt(dockerablePeers.length)];

		let stream = await selfNode.dialProtocol(dockerablePeer.id, '/zip');

		peer().currentDockerPeerStream = stream;

		const writeEmitter = new vscode.EventEmitter<string>();
		let command = '';
		let consoleOutput: Pushable<string> = pushable<string>({ objectMode: true });

		pipe(
			consoleOutput,
			(source) => {
				return (async function* () {
					for await (const msg of source) { yield uint8ArrayFromString(msg); };
				})();
			},
			stream
		);

		consoleOutput.push(jsonMsg);

		const pty: vscode.Pseudoterminal = {
			onDidWrite: writeEmitter.event,
			open: () => { },
			close: () => { },
			handleInput: data => {
				if (data === '\r') {
					vscode.window.showInformationMessage(command);
					let commandMsg = new CommandMessage(command);

					consoleOutput.push(JSON.stringify(commandMsg));

					// send current command via stream
					writeEmitter.fire('\r\n');
					command = '';
				} else {
					command += data;
					writeEmitter.fire(data);
				}
			}
		};
		let terminal = vscode.window.createTerminal({ name: 'My terminal', pty });
		terminal.show();

		// Setup pipe that handles incomming messages. (Ex. console output from the container started on docker host)
		pipe(
			stream,
			(source) => {
				return (async function* () {
					for await (const buf of source) { yield uint8ArrayToString(buf.subarray()); }
				})();
			},
			async (source) => {
				for await (const msg of source) {
					console.log(msg);
					let msg1 = msg.replaceAll("\n", "\n\r");
					if (!msg1.endsWith('\n') || !msg1.endsWith("\n\r")) {
						msg1 += "\n\r";
					}
					writeEmitter.fire(msg1);
				}
			}
		);

		logger().info(`Sent zipped folder: ${ws.name}`);
		vscode.window.showInformationMessage(`Sent zipped folder: ${ws.name}`);
	} else {
		vscode.window.showErrorMessage('Found no applicable workspace folders to work with :(');
	}
}

async function filter(arr: Peer[], callback: any) {
	const fail = Symbol();
	let tmp = (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail)));
	let result: Peer[] = [];

	tmp.forEach((item) => {
		if (item !== fail) {
			result.push(item);
		}
	});
	return result;
}


async function destroyContainer(context: vscode.ExtensionContext) {
	if (peer().currentDockerPeerStream) {
		let currentDockerPeerStream = peer().currentDockerPeerStream!;

		let destroyContainerPushable: Pushable<string> = pushable<string>({ objectMode: true });

		pipe(
			destroyContainerPushable,
			(source) => {
				return (async function* () {
					for await (const msg of source) { yield uint8ArrayFromString(msg); };
				})();
			},
			currentDockerPeerStream
		);

		let destroyContainerMessage = new DestroyContainerMessage();

		destroyContainerPushable.push(JSON.stringify(destroyContainerMessage));

		//peer().currentDockerPeerStream = undefined;
	}
}

export function registerFilePublisher(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('colab.sendProjectFiles', async () => await publishFiles(context)));
}

export function registerDestroyContainer(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('colab.destroyContainer', async () => await destroyContainer(context)));
}
