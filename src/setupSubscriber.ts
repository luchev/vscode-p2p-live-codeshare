import * as vscode from "vscode";
import { Libp2p } from "libp2p";
import { toast } from "./shared/toast";
import { peer } from "./shared/state/peer";
import { readSettingsFile, writeSettingsFile } from "./shared/settingsHandler";
import { logger } from "./shared/logger";

export async function setupSubscriber(ctx: vscode.ExtensionContext) {
  if (peer().isPeerSetup()) {
    return;
  }

  const shouldRequestWorkspaceSync =
    (await vscode.window.showInformationMessage(
      "Do you want to sync workspaces?",
      "Yes",
      "No"
    )) === "Yes";

  await readSettingsFile(ctx, peer().settingsFile).then(
    (peerSettings) => {
      logger().info("Reconnecting old subscriber.");
      peer()
        .recover(
          peerSettings.peerId,
          peerSettings.port,
          [],
          shouldRequestWorkspaceSync
        )
        .then((peer) => peer.initSubscriber(ctx))
        .catch((err) => {
          toast(err);
        });
    },
    async () => {
      const inputAddress = await vscode.window.showInputBox({
        placeHolder: "Multiaddress",
        prompt: "Type in the host Multiaddress",
      });

      logger().info("Starting new subscriber");
      peer()
        .new([inputAddress ?? ""])
        .then((peer) => peer.initSubscriber(ctx))
        .catch((err) => {
          toast(err);
        })
        .then(() => {
          peer()
            .p2p()
            .then((p2p) => {
              const multiAddrs = p2p.getMultiaddrs();
              if (multiAddrs.length === 0) {
                logger().error("Peer node has no multiaddrs.");
              } else {
                const port = multiAddrs[0].nodeAddress().port;
                const peerId = peer().peer!.peerId;
                writeSettingsFile(ctx, peer().settingsFile, peerId, port);
              }
            });
        });
    }
  );
}

export function registerSetupSubscriber(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("colab.setupSubscriber", async () =>
      setupSubscriber(ctx)
    )
  );
}

export let subscribeNode: Libp2p;
