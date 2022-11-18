import * as vscode from 'vscode';
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { addCommonListeners, createNode } from './shared/createNode';
import { Topics } from './shared/constants';
import { multiaddr } from '@multiformats/multiaddr';
import { logger } from './shared/logger';
import { Message } from '@libp2p/interface-pubsub';
import { peer2 } from './shared/peers';
import { createFromProtobuf } from '@libp2p/peer-id-factory';
import { Libp2p } from 'libp2p';

export async function setupSubscriber(ctx: vscode.ExtensionContext) {
	const peerid = await createFromProtobuf(uint8ArrayFromString(peer2, "base64"));
	const topic = Topics.ChangeFile;
	const node1 = await Promise.resolve(createNode(peerid, 9000));

	node1.pubsub.addEventListener("message", (evt) => {
		console.log('evt.detail', evt.detail as Message);
		logger().info(`node1 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`);
		vscode.window.showInformationMessage(`node1 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`);
	});
	node1.pubsub.subscribe(topic);

	addCommonListeners(ctx, node1);

	const inputAddress = await vscode.window.showInputBox({
		placeHolder: "Multiaddress",
		prompt: "Type in the host Multiaddress",
	});
	if (inputAddress === undefined || inputAddress === '') {
		vscode.window.showErrorMessage('An Address is mandatory');
	} else {
		await node1.dial(multiaddr(inputAddress.trim()));
	}

	subscribeNode = node1;
}

export function registerSetupSubscriber(ctx: vscode.ExtensionContext) {
	ctx.subscriptions.push(vscode.commands.registerCommand(
		'p2p-share.setupSubscriber',
		async () => setupSubscriber(ctx))
	);
}

export let subscribeNode: Libp2p;
