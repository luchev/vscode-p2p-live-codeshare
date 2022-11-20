import * as vscode from "vscode";
import { Topics } from "./shared/constants";
import { logger } from "./shared/logger";
import { toHumanReadableName } from "./shared/nameGenerator";
import { handleWorkspaceEvent } from "./shared/actions/workspace";
import { handlePeerDiscovery } from "./shared/actions/peer-discovery";
import { Libp2p } from "libp2p";

import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { addCommonListeners, createNode } from './shared/createNode';
import { multiaddr } from '@multiformats/multiaddr';
import { Message } from '@libp2p/interface-pubsub';
import { peer2 } from './shared/peers';
import { createFromProtobuf } from '@libp2p/peer-id-factory';

let subscriberName = "";
let peer: Libp2p | undefined = undefined;

export async function setupSubscriber(ctx: vscode.ExtensionContext) {
	const peerid = await createFromProtobuf(uint8ArrayFromString(peer2, "base64"));
	const topic = Topics.workspaceUpdates;
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
    return;
	}

  await createNode([inputAddress.trim()])
    .then((node) => {
      peer = node;
      subscriberName = toHumanReadableName(peer.peerId.toString());
      logger().info("Subscriber started", {
        id: subscriberName,
        addresses: peer.getMultiaddrs().map((x) => x.toString()),
      });
    })
    .catch((err) => {
      logger().warn("Subscriber failed to start", err);
    });

  const subscriber = peer!;

  subscriber.addEventListener("peer:discovery", (event) =>
    handlePeerDiscovery(event, subscriberName)
  );
  subscriber.pubsub.subscribe(Topics.workspaceUpdates);
  subscriber.pubsub.addEventListener("message", (event) => {
    handleWorkspaceEvent(event);
  });

	subscribeNode = node1;
}

export function registerSetupSubscriber(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("p2p-share.setupSubscriber", async () =>
      setupSubscriber(ctx)
    )
  );
}

export let subscribeNode: Libp2p;
