import * as vscode from "vscode";
import { Libp2p } from "libp2p";
import { peer } from "./shared/state/peer";
import { toast } from "./shared/toast";
import { writeSettingsFile, readSettingsFile } from "./shared/settingsHandler";
import { peerIdFromString, peerIdFromPeerId} from '@libp2p/peer-id';

async function setupPublisher(ctx: vscode.ExtensionContext) {
  if (peer().isPeerSetup()) {
    return;
  }

  await readSettingsFile(ctx, peer().settingsFile).then(
    (peerSettings) => {
      peer()
      .recover(peerSettings.peerId, peerSettings.port)
      .then((peer) => peer.initPublisher(ctx))
      .catch((err) => {
        toast(err);
      });
      
    },
    () => {
      peer()
      .new()
      .then((peer) => peer.initPublisher(ctx))
      .catch((err) => {
        toast(err);
      });
    }
  ).then(
    () => {
      writeSettingsFile(ctx, peer().settingsFile, peer().peer!.peerId.toString(), peer().port!);
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
