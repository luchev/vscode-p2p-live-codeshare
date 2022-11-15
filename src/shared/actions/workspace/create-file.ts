import {existsSync, writeFileSync} from "fs";
import path from "path";
import {workspace} from "vscode";
import {CreateFileEvent} from "../../events/workspace";
import {WorkspaceEvent} from "../../events/workspace/event";
import {getWorkspaceRoot} from "../../workspace-path";

export function handleCreateFile(message: WorkspaceEvent) {
  const params = message as CreateFileEvent;
  const absolutePath = path.join(getWorkspaceRoot(), ...params.path);
  if (!existsSync(absolutePath)) {
    writeFileSync(absolutePath, '');
  }
}
