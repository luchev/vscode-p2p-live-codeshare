import * as vscode from "vscode";
import { createNode } from "./shared/createNode";
import { logger } from "./shared/logger";
import { toHumanReadableName } from "./shared/nameGenerator";
import { handlePeerDiscovery } from "./shared/actions/peer-discovery";
import { Libp2p } from "libp2p";
import { onFileCreated, onFileDeleted } from "./shared/listeners/workspace";

let publisherName = "";
let publisher: Libp2p | undefined = undefined;

async function setupPublisher(ctx: vscode.ExtensionContext) {
  if (publisher !== undefined) {
    return;
  }

  publisher = await Promise.resolve(createNode([]));
  if (publisher === undefined) {
    logger().warn("Publisher failed to start");
    return;
  }
  publisherName = toHumanReadableName(publisher.peerId.toString());

  logger().info("Publisher started", {
    id: publisherName,
    addresses: publisher.getMultiaddrs().map((x) => x.toString()),
  });

  publisher.addEventListener("peer:discovery", (event) =>
    handlePeerDiscovery(event, publisherName)
  );

  vscode.workspace.onDidCreateFiles((event) =>
    onFileCreated(publisher!, event)
  );
  vscode.workspace.onDidDeleteFiles((event) =>
    onFileDeleted(publisher!, event)
  );

  // vscode.workspace.onDidChangeTextDocument(
  //   (event) => {
  //     if (
  //       event.document.fileName ==
  //       "extension-output-undefined_publisher.p2p-share-#1-p2p-share"
  //     ) {
  //       return;
  //     }

  //     publisher.pubsub
  //       .publish(Topics.ChangeFile, uint8ArrayFromString(JSON.stringify(event)))
  //       .then((x) =>
  //         logger().info("Publisher sent a message", {
  //           topic: Topics.ChangeFile,
  //           data: event,
  //           subscribers: x.recipients.map((x) => readableName(x.toString())),
  //         })
  //       )
  //       .catch((err) =>
  //         logger().warn("Publisher failed to send message", { error: err })
  //       );
  //   },
  //   null,
  //   ctx.subscriptions
  // );
}

export function registerSetupPublisher(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("p2p-share.setupPublisher", async () =>
      setupPublisher(ctx)
    )
  );
}
