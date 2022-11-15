import * as vscode from "vscode";
import { createNode } from "./shared/createNode";
import { logger } from "./shared/logger";
import { toHumanReadableName } from "./shared/nameGenerator";
import { handlePeerDiscovery } from "./shared/actions/peer-discovery";
import { Libp2p } from "libp2p";
import {
  onFileOrDirectoryCreated,
  onFileOrDirectoryDeleted,
} from "./shared/listeners/workspace";
import { onFileChanged } from "./shared/listeners/workspace/file-changed";

let publisherName = "";
let peer: Libp2p | undefined = undefined;

async function setupPublisher(ctx: vscode.ExtensionContext) {
  if (peer !== undefined) {
    return;
  }

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
}

export function registerSetupPublisher(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("p2p-share.setupPublisher", async () =>
      setupPublisher(ctx)
    )
  );
}
