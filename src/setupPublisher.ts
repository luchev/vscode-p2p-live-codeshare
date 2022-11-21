import * as vscode from "vscode";
import { logger } from "./shared/logger";
import { handlePeerDiscovery } from "./shared/actions/peer-discovery";
import { Libp2p } from "libp2p";
import {
  onFileOrDirectoryCreated,
  onFileOrDirectoryDeleted,
} from "./shared/listeners/workspace";
import { onFileChanged } from "./shared/listeners/workspace/file-changed";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { addCommonListeners, createNode } from "./shared/createNode";
import { createFromProtobuf } from "@libp2p/peer-id-factory";
import { peer1 } from "./shared/peers";
import { isPeerSetup, peer, peerName, setPeer } from "./shared/state/peer";

async function setupPublisher(ctx: vscode.ExtensionContext) {
  if (isPeerSetup()) {
    return;
  }
  const peerid = await createFromProtobuf(
    uint8ArrayFromString(peer1, "base64")
  );

  setPeer(await Promise.resolve(createNode({ peerId: peerid, port: 8000 })));


  peer().addEventListener("peer:discovery", (event) =>
    handlePeerDiscovery(event, peerName())
  );

  vscode.workspace.onDidCreateFiles((event) =>
    onFileOrDirectoryCreated(peer(), event)
  );
  vscode.workspace.onDidDeleteFiles((event) =>
    onFileOrDirectoryDeleted(peer(), event)
  );
  vscode.workspace.onDidChangeTextDocument((event) =>
    onFileChanged(peer(), event)
  );

  addCommonListeners(ctx, peer());
}

export function registerSetupPublisher(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("p2p-share.setupPublisher", async () =>
      setupPublisher(ctx)
    )
  );
}

export let publishNode: Libp2p;
