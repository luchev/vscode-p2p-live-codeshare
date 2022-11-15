import { existsSync, writeFileSync } from "fs";
import path from "path";
import { workspace } from "vscode";
import { ShareFileEvent } from "../../events/workspace";
import {WorkspaceEvent} from "../../events/workspace/event";

export function handleShareFile(message: WorkspaceEvent) {
  const params = message as ShareFileEvent;
  const workspaceDir = workspace.workspaceFolders?.[0].uri.fsPath!;
  const absolutePath = path.join(workspaceDir, ...params.path);
  writeFileSync(absolutePath, params.content);
}
