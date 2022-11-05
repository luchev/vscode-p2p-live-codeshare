import * as vscode from "vscode";
import {relayAddresses} from "./shared/createNode";

async function setupRelay(ctx: vscode.ExtensionContext) {
  await relayAddresses();
}

export function registerSetupRelay(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("p2p-share.setupRelay", async () =>
      setupRelay(ctx)
    )
  );
}
