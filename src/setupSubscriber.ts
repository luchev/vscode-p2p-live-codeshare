import * as vscode from "vscode";
import { createNode } from "./shared/createNode";
import { Topics } from "./shared/constants";
import { logger } from "./shared/logger";
import { toHumanReadableName } from "./shared/nameGenerator";
import { handleWorkspaceEvent } from "./shared/actions/workspace";
import { handlePeerDiscovery } from "./shared/actions/peer-discovery";
import { Libp2p } from "libp2p";
import { p2pShareProvider } from './sessionData';

let subscriberName = "";
let peer: Libp2p | undefined = undefined;

async function setupSubscriber(ctx: vscode.ExtensionContext) {
  if (peer !== undefined) {
    logger().info("Subscriber already running");
    return;
  }

  const inputAddress = await vscode.window.showInputBox({
    placeHolder: "Relay",
    prompt: "Type in the Relay address",
  });

  if (inputAddress === undefined || inputAddress === "") {
    logger().warn("Invalid relay address provided to the subscriber");
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
}

export function registerSetupSubscriber(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("p2p-share.setupSubscriber", async () =>
      setupSubscriber(ctx)
    )
  );
}
