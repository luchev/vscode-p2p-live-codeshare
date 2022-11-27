import * as vscode from "vscode";
import { Libp2p } from "libp2p";
import { peer } from "./shared/state/peer";
import { toast } from "./shared/toast";

async function setupPublisher(ctx: vscode.ExtensionContext) {
  if (peer().isPeerSetup()) {
    return;
  }

  peer()
  .connect(ctx)
  .then(
    (peer) => {
      peer!.initPublisher(ctx).then(
        (peer) => peer.writeSettingsToFile(ctx)
      );
    }
    ).catch((err) => {
    toast(err);
  });
}

export function registerSetupPublisher(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("colab.setupPublisher", async () =>
      setupPublisher(ctx)
    )
  );
}

export let publishNode: Libp2p;
