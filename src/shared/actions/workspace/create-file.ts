import {existsSync, writeFileSync} from "fs";
import path from "path";
import {workspace} from "vscode";
import {CreateFileEvent} from "../../events/workspace";
import {WorkspaceEvent} from "../../events/workspace/event";

export function handleCreateFile(message: WorkspaceEvent) {
  const params = message as CreateFileEvent;
  const workspaceDir = workspace.workspaceFolders?.[0].uri.fsPath!;
  const absolutePath = path.join(workspaceDir, ...params.path);
  if (!existsSync(absolutePath)) {
    writeFileSync(absolutePath, '');
  }
}
