import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { workspace } from "vscode";
import { CreateDirectoryEvent, CreateFileEvent } from "../../events/workspace";
import {WorkspaceEvent} from "../../events/workspace/event";
import {getWorkspaceRoot} from "../../workspace-path";

export function handleCreateDirectory(message: WorkspaceEvent) {
  const params = message as CreateDirectoryEvent;
  const absolutePath = path.join(getWorkspaceRoot(), ...params.path);
  if (!existsSync(absolutePath)) {
    mkdirSync(absolutePath);
  }
}
