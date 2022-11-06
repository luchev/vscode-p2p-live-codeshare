import * as vscode from "vscode";
import {startRelay} from "./shared/createNode";

async function setupRelay(ctx: vscode.ExtensionContext) {
  await startRelay();
}

export function registerSetupRelay(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("p2p-share.setupRelay", async () =>
      setupRelay(ctx)
    )
  );
}
