import * as vscode from "vscode";
import { Libp2p } from "libp2p";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { createFromProtobuf } from "@libp2p/peer-id-factory";
import { peer1 } from "./shared/peers";
import { peer } from "./shared/state/peer";
import { toast } from "./shared/toast";

async function setupPublisher(ctx: vscode.ExtensionContext) {
  if (peer().isPeerSetup()) {
    return;
  }

  const peerid = await createFromProtobuf(
    uint8ArrayFromString(peer1, "base64")
  );

  peer()
    .recover(peerid, 8000)
    .then((peer) => peer.initPublisher(ctx))
    .catch((err) => {
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
