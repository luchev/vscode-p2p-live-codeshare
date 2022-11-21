import * as vscode from "vscode";
import { Libp2p } from "libp2p";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { peer2 } from "./shared/peers";
import { createFromProtobuf } from "@libp2p/peer-id-factory";
import {toast} from "./shared/toast";
import {peer} from "./shared/state/peer";

export async function setupSubscriber(ctx: vscode.ExtensionContext) {
  if (peer().isPeerSetup()) {
    return;
  }

  const peerid = await createFromProtobuf(
    uint8ArrayFromString(peer2, "base64")
  );
  const inputAddress = await vscode.window.showInputBox({
    placeHolder: "Multiaddress",
    prompt: "Type in the host Multiaddress",
  });

  peer()
    .recover(peerid, 9000, [inputAddress ?? ''])
    .then((peer) => peer.initSubscriber(ctx))
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
