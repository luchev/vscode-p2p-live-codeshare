import * as vscode from "vscode";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { createNode } from "./shared/createNode";
import { Topics } from "./shared/constants";
import { logger } from "./shared/logger";
import { generateName as readableName } from "./shared/nameGenerator";

let sequenceId = 0;
let _discoveredPeers = new Set();

async function setupPublisher(ctx: vscode.ExtensionContext) {
  //   let bootstrap = await setupRelay(); // This starts a 3rd node
  const publisher = await Promise.resolve(createNode([]));
  logger().info("Publisher started", {
    id: readableName(publisher.peerId.toString()),
    addresses: publisher.getMultiaddrs().map((x) => x.toString()),
  });

  publisher.addEventListener("peer:discovery", (evt) => {
    const peerId = evt.detail.id.toString();
    if (_discoveredPeers.has(peerId)) {
      return;
    }
    _discoveredPeers.add(peerId);
    logger().info("Publisher discovered peer", {
      PeerId: readableName(peerId),
    });
  });

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (
        event.document.fileName ==
        "extension-output-undefined_publisher.p2p-share-#1-p2p-share"
      ) {
        return;
      }
      publisher.pubsub
        .publish(Topics.ChangeFile, uint8ArrayFromString(JSON.stringify(event)))
        .then((x) =>
          logger().info("Publisher sent a message", {
            topic: Topics.ChangeFile,
            data: event,
            subscribers: x.recipients.map((x) => readableName(x.toString())),
          })
        )
        .catch((err) =>
          logger().warn("Publisher failed to send message", { error: err })
        );
    },
    null,
    ctx.subscriptions
  );

  // setInterval(() => {
  //   const msg = "Ping " + sequenceId;
  //   sequenceId += 1;
  //   publisher.pubsub
  //     .publish(Topics.ChangeFile, uint8ArrayFromString(msg))
  //     .then((x) =>
  //       logger().info("Publisher sent a message", {
  //         topic: Topics.ChangeFile,
  //         data: msg,
  //         subscribers: x.recipients.map(x => readableName(x.toString())),
  //       })
  //     )
  //     .catch((err) =>
  //       logger().warn("Publisher failed to send message", { error: err })
  //     );
  // }, 5000);
}

export function registerSetupPublisher(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("p2p-share.setupPublisher", async () =>
      setupPublisher(ctx)
    )
  );
}
