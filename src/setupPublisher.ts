import * as vscode from "vscode";
import { Libp2p } from "libp2p";
import { peer } from "./shared/state/peer";
import { toast } from "./shared/toast";
import { writeSettingsFile, readSettingsFile } from "./shared/settingsHandler";
import { peerIdFromString } from '@libp2p/peer-id';
import { logger } from "./shared/logger";

async function setupPublisher(ctx: vscode.ExtensionContext) {
  if (peer().isPeerSetup()) {
    return;
  }

  readSettingsFile(ctx, peer().settingsFile).then(
    (peerSettings) => {
      peer()
      .recover(peerIdFromString(peerSettings.peerId), peerSettings.port)
      .then((peer) => peer.initPublisher(ctx))
      .catch((err) => {
        toast(err);
      });
      
    },
    () => {
      // init peer with default parameter
      logger().info("not implemented yet");
    }
  );

  writeSettingsFile(ctx, peer().peer?.peerId.toString()!, peer().peerName(), peer().port!);
}

export function registerSetupPublisher(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("colab.setupPublisher", async () =>
      setupPublisher(ctx)
    )
  );
}

export let publishNode: Libp2p;
