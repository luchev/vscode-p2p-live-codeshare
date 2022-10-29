import * as vscode from 'vscode';
import {fromString as uint8ArrayFromString} from "uint8arrays/from-string";
import {createNode} from './shared/createNode';
import {Topics} from './shared/constants';

async function setupPublisher(ctx: vscode.ExtensionContext) {
	const topic = Topics.ChangeFile;
	const node2 = await Promise.resolve(createNode())
	vscode.window.showInformationMessage('started publisher: ' + node2.getMultiaddrs()[1]); // 1 is the non-localhost one

	setInterval(() => {
		node2.pubsub.publish(topic, uint8ArrayFromString('Bird bird bird, bird is the word!')).catch(err => {
			vscode.window.showInformationMessage(err);
		})
	}, 1000)
}

export function registerSetupPublisher(ctx: vscode.ExtensionContext) {
	ctx.subscriptions.push(vscode.commands.registerCommand(
		'p2p-share.setupPublisher',
		async () => setupPublisher(ctx))
	);
}
