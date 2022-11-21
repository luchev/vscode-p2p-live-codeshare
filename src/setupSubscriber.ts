import * as vscode from "vscode";
import { Topics } from "./shared/constants";
import { handleWorkspaceEvent } from "./shared/actions/workspace";
import { handlePeerDiscovery } from "./shared/actions/peer-discovery";
import { Libp2p } from "libp2p";

import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { addCommonListeners, createNode } from "./shared/createNode";
import { peer2 } from "./shared/peers";
import { createFromProtobuf } from "@libp2p/peer-id-factory";
import { isPeerSetup, peer, peerName, setPeer } from "./shared/state/peer";

export async function setupSubscriber(ctx: vscode.ExtensionContext) {
  if (isPeerSetup()) {
    return;
  }

  const peerid = await createFromProtobuf(
    uint8ArrayFromString(peer2, "base64")
  );
  const inputAddress = await vscode.window.showInputBox({
    placeHolder: "Multiaddress",
    prompt: "Type in the host Multiaddress",
  });

  setPeer(
    await Promise.resolve(
      createNode({
        peerId: peerid,
        port: 9000,
        bootstrapAddresses: [(inputAddress ?? '')],
      })
    )
  );
  peer().pubsub.subscribe(Topics.workspaceUpdates);
  addCommonListeners(ctx, peer());

  peer().addEventListener("peer:discovery", (event) =>
    handlePeerDiscovery(event, peerName())
  );
  peer().pubsub.subscribe(Topics.workspaceUpdates);
  peer().pubsub.addEventListener("message", (event) => {
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

export let subscribeNode: Libp2p;
