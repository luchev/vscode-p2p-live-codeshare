import * as vscode from "vscode";
import { Libp2p } from "libp2p";
import {toast} from "./shared/toast";
import {peer} from "./shared/state/peer";

export async function setupSubscriber(ctx: vscode.ExtensionContext) {
  if (peer().isPeerSetup()) {
    return;
  }

  const inputAddress = await vscode.window.showInputBox({
    placeHolder: "Multiaddress",
    prompt: "Type in the host Multiaddress",
  });

  peer()
    .connect(ctx, [inputAddress ?? ''])
    .then((peer) => peer!.initSubscriber(ctx).then(
      (peer) => peer.writeSettingsToFile(ctx)
    ))
    .catch((err) => {
      toast(err);
    });

}

export function registerSetupSubscriber(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("colab.setupSubscriber", async () =>
      setupSubscriber(ctx)
    )
  );
}

export let subscribeNode: Libp2p;
