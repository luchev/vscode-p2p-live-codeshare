import { existsSync, lstatSync, rmdirSync, rmSync } from "fs";
import path from "path";
import { workspace } from "vscode";
import { CreateFileEvent, DeleteFileEvent } from "../../events/workspace";
import { WorkspaceEvent } from "../../events/workspace/event";
import { getWorkspaceRoot } from "../../workspace-path";

export function handleDeleteFile(message: WorkspaceEvent) {
  const params = message as DeleteFileEvent;
  const absolutePath = path.join(getWorkspaceRoot(), ...params.path);
  if (existsSync(absolutePath)) {
    if (lstatSync(absolutePath).isFile()) {
      rmSync(absolutePath);
    } else {
      rmdirSync(absolutePath, { recursive: true });
    }
  }
}
