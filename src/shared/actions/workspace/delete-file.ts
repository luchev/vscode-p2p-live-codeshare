import { existsSync, lstatSync, rmdirSync, rmSync } from "fs";
import path from "path";
import { workspace } from "vscode";
import { CreateFileEvent } from "../../events/workspace";

export function handleDeleteFile(message: CreateFileEvent) {
  const workspaceDir = workspace.workspaceFolders?.[0].uri.fsPath!;
  const absolutePath = path.join(workspaceDir, ...message.path);
  if (existsSync(absolutePath)) {
    if (lstatSync(absolutePath).isFile()) {
    rmSync(absolutePath);
    } else {
      rmdirSync(absolutePath, {recursive: true})
    }
  }
}
