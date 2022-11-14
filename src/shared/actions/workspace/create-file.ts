import {existsSync, writeFileSync} from "fs";
import path from "path";
import {workspace} from "vscode";
import {CreateFileEvent} from "../../events/workspace";

export function handleCreateFile(message: CreateFileEvent) {
  const workspaceDir = workspace.workspaceFolders?.[0].uri.fsPath!;
  const absolutePath = path.join(workspaceDir, ...message.path);
  if (!existsSync(absolutePath)) {
    writeFileSync(absolutePath, '');
  }
}
