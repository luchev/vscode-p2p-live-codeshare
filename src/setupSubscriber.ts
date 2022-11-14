import * as vscode from "vscode";
import { createNode } from "./shared/createNode";
import { Topics } from "./shared/constants";
import { logger } from "./shared/logger";
import { toHumanReadableName } from "./shared/nameGenerator";
import { fromWire, WorkspaceEventType } from "./shared/events/workspace/event";
import path from "path";
import fs from "fs";
import { handleWorkspaceEvent } from "./shared/actions/workspace";

let _discoveredPeers = new Set();

async function setupSubscriber(ctx: vscode.ExtensionContext) {
  const inputAddress = await vscode.window.showInputBox({
    placeHolder: "Relay",
    prompt: "Type in the Relay address",
  });

  if (inputAddress === undefined || inputAddress === "") {
    logger().warn("Invalid relay address provided to the subscriber");
    return;
  }

  const subscriber = await Promise.resolve(createNode([inputAddress.trim()]));
  logger().info("Subscriber set up successfully", {
    id: toHumanReadableName(subscriber.peerId.toString()),
    addresses: subscriber.getMultiaddrs().map((x) => x.toString()),
  });

  subscriber.pubsub.subscribe(Topics.WorkspaceUpdates);
  subscriber.pubsub.addEventListener("message", (event) => {
    handleWorkspaceEvent(event)
  });

  // subscriber.pubsub.subscribe(Topics.ChangeFile);
  // subscriber.pubsub.addEventListener("message", (evt) => {
  //   const topic = evt.detail.topic;
  //   if (SkipTopics.has(topic)) {
  //     return;
  //   }

  //   let data = JSON.parse(
  //     uint8ArrayToString(evt.detail.data)
  //   ) as vscode.TextDocumentChangeEvent;
  //   copyEdit(data);

  //   logger().info("Subscriber received message", {
  //     data: data,
  //     topic: evt.detail.topic,
  //   });
  // });

  subscriber.addEventListener("peer:discovery", (evt) => {
    const peerId = evt.detail.id.toString();
    if (_discoveredPeers.has(peerId)) {
      return;
    }
    _discoveredPeers.add(peerId);
    logger().info("Subscriber discovered peer", {
      peerId: toHumanReadableName(peerId),
    });
  });
}

export function registerSetupSubscriber(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("p2p-share.setupSubscriber", async () =>
      setupSubscriber(ctx)
    )
  );
}
