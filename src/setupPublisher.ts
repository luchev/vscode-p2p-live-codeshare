import * as vscode from "vscode";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { createNode, relayAddresses as setupRelay } from "./shared/createNode";
import { Topics } from "./shared/constants";
import { logger } from "./shared/logger";

let sequenceId = 0;
let _discoveredPeers = new Set();

async function setupPublisher(ctx: vscode.ExtensionContext) {
  let bootstrap = await setupRelay();
  const publisher = await Promise.resolve(createNode(bootstrap));

  publisher.addEventListener("peer:discovery", (evt) => {
    const peerId = evt.detail.id.toString();
    if (_discoveredPeers.has(peerId)) {
      return;
    }
    _discoveredPeers.add(peerId);
    logger().info("Subscriber discovered peer", { PeerId: peerId });
  });

  setInterval(() => {
    const msg = "Ping " + sequenceId;
    sequenceId += 1;
    publisher.pubsub
      .publish(Topics.ChangeFile, uint8ArrayFromString(msg))
      .then((x) =>
        logger().info("Publisher sent a message", {
          topic: Topics.ChangeFile,
          data: msg,
          subscribers: x.recipients,
        })
      )
      .catch((err) =>
        logger().warn("Publisher failed to send message", { error: err })
      );
  }, 5000);

  logger().info("Publisher set up");
}

export function registerSetupPublisher(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("p2p-share.setupPublisher", async () =>
      setupPublisher(ctx)
    )
  );
}
