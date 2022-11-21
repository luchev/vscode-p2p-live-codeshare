import * as vscode from "vscode";
import {peer} from "./shared/state/peer";
import {toast} from "./shared/toast";

async function disconnect(ctx: vscode.ExtensionContext) {
  if (!peer().isPeerSetup()) {
    toast(`You're not connected to anyone`)
  } else {
    await peer().kill();
    toast(`You've been disconnected from the network`)
  }
}

export function registerDisconnect(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("colab.disconnect", async () =>
      disconnect(ctx)
    )
  );
}
