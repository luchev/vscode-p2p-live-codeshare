import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { workspace } from "vscode";
import { CreateDirectoryEvent, CreateFileEvent } from "../../events/workspace";
import {WorkspaceEvent} from "../../events/workspace/event";

export function handleCreateDirectory(message: WorkspaceEvent) {
  const params = message as CreateDirectoryEvent;
  const workspaceDir = workspace.workspaceFolders?.[0].uri.fsPath!;
  const absolutePath = path.join(workspaceDir, ...params.path);
  if (!existsSync(absolutePath)) {
    mkdirSync(absolutePath);
  }
}
