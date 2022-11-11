import * as vscode from 'vscode';
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { createNode } from './shared/createNode';
import { Topics } from './shared/constants';
import { createFromProtobuf } from '@libp2p/peer-id-factory';
import { peer1 } from './shared/peers';
import { Connection } from '@libp2p/interface-connection';
import { pipe } from 'it-pipe';

async function setupPublisher(ctx: vscode.ExtensionContext) {
	const peerid = await createFromProtobuf(uint8ArrayFromString(peer1, "base64"));
	const topic = Topics.ChangeFile;
	const node2 = await Promise.resolve(createNode(peerid));
	vscode.window.showInformationMessage('started publisher: ' + node2.getMultiaddrs().join("\n")); // 1 is the non-localhost one

	/*setInterval(() => {
		node2.pubsub.publish(topic, uint8ArrayFromString('Bird bird bird, bird is the word!')).catch(err => {
			vscode.window.showInformationMessage(err);
		});
	}, 1000);*/

	node2.connectionManager.addEventListener("peer:connect", async (evt) => {
		const connection = evt.detail as Connection;
		console.log('Connected to %s', connection.remotePeer.toString()); // Log connected peer
		const stream = await connection.newStream("/zip");
		pipe(
			[uint8ArrayFromString("hello")],
			stream);
	});

}

export function registerSetupPublisher(ctx: vscode.ExtensionContext) {
	ctx.subscriptions.push(vscode.commands.registerCommand(
		'p2p-share.setupPublisher',
		async () => setupPublisher(ctx))
	);
}
