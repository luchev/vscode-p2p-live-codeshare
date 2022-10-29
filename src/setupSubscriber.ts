import * as vscode from 'vscode';
import {toString as uint8ArrayToString} from "uint8arrays/to-string";
import {createNode} from './shared/createNode';
import {Topics} from './constants';
import {multiaddr } from '@multiformats/multiaddr'
import {logger} from './shared/logger';

export async function setupSubscriber(ctx: vscode.ExtensionContext) {
	const topic = Topics.ChangeFile;
	const node1 = await Promise.resolve(createNode())
	node1.pubsub.addEventListener("message", (evt) => {
		logger().info(`node1 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
		vscode.window.showInformationMessage(`node1 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`);
	})
	node1.pubsub.subscribe(topic)

	const inputAddress = await vscode.window.showInputBox({
		placeHolder: "Multiaddress",
		prompt: "Type in the host Multiaddress",
	});
	if (inputAddress === undefined || inputAddress === '') {
		vscode.window.showErrorMessage('An Address is mandatory');
	} else {
		await node1.dial(multiaddr(inputAddress.trim()))
	}
}
