import * as vscode from "vscode";
import { Libp2p } from "libp2p";
import { peer } from "./shared/state/peer";
import { toast } from "./shared/toast";
import { writeSettingsFile, readSettingsFile } from "./shared/settingsHandler";
import { logger } from "./shared/logger";

async function setupPublisher(ctx: vscode.ExtensionContext) {
  if (peer().isPeerSetup()) {
    return;
  }

  await readSettingsFile(ctx, peer().settingsFile).then(
    (peerSettings) => {
      logger().info("Reconnecting old publisher.");
      peer()
      .recover(peerSettings.peerId, peerSettings.port)
      .then((peer) => peer.initPublisher(ctx))
      .catch((err) => {
        toast(err);
      });
    },
    () => {
      logger().info("Starting new publisher");
      peer()
      .new()
      .then((peer) => peer.initPublisher(ctx))
      .catch((err) => {
        toast(err);
      }).then(
        () => {
          peer().p2p().then(
            (p2p) => {
              const multiAddrs = p2p.getMultiaddrs();
              if (multiAddrs.length === 0) {
                logger().error("Peer node has no multiaddrs.");
              } else {
                const port = multiAddrs[0].nodeAddress().port;
                const peerId = peer().peer!.peerId;
                writeSettingsFile(ctx, peer().settingsFile, peerId, port); 
              }
          });
        }
      );
    }
  );
}

export function registerSetupPublisher(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("colab.setupPublisher", async () =>
      setupPublisher(ctx)
    )
  );
}

export let publishNode: Libp2p;
