import * as vscode from "vscode";
import { logger } from "./shared/logger";
import { toHumanReadableName } from "./shared/nameGenerator";
import { handlePeerDiscovery } from "./shared/actions/peer-discovery";
import { Libp2p } from "libp2p";
import {
  onFileOrDirectoryCreated,
  onFileOrDirectoryDeleted,
} from "./shared/listeners/workspace";
import { onFileChanged } from "./shared/listeners/workspace/file-changed";
import { p2pShareProvider } from './sessionData';

let publisherName = "";
let peer: Libp2p | undefined = undefined;
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { addCommonListeners, createNode } from './shared/createNode';
import { createFromProtobuf } from '@libp2p/peer-id-factory';
import { peer1 } from './shared/peers';

async function setupPublisher(ctx: vscode.ExtensionContext) {
  if (peer !== undefined) {
    return;
  }
	const peerid = await createFromProtobuf(uint8ArrayFromString(peer1, "base64"));
	const node2 = await Promise.resolve(createNode(peerid, 8000));
	vscode.window.showInformationMessage('started publisher: ' + node2.getMultiaddrs().join("\n")); // 1 is the non-localhost one

  await createNode([])
    .then((node) => {
      peer = node;
      publisherName = toHumanReadableName(peer.peerId.toString());
      logger().info("Publisher started", {
        id: publisherName,
        addresses: peer.getMultiaddrs().map((x) => x.toString()),
      });
    })
    .catch(() => {
      logger().warn("Publisher failed to start");
    });

  const publisher = peer!;

  publisher.addEventListener("peer:discovery", (event) =>
    handlePeerDiscovery(event, publisherName)
  );

  vscode.workspace.onDidCreateFiles((event) =>
    onFileOrDirectoryCreated(publisher, event)
  );
  vscode.workspace.onDidDeleteFiles((event) =>
    onFileOrDirectoryDeleted(publisher, event)
  );
  vscode.workspace.onDidChangeTextDocument((event) =>
    onFileChanged(publisher, event)
  );

	addCommonListeners(ctx, node2);

	publishNode = node2;

}

export function registerSetupPublisher(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("p2p-share.setupPublisher", async () =>
      setupPublisher(ctx)
    )
  );
}

export let publishNode: Libp2p;
