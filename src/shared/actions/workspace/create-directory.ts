import { existsSync, mkdirSync} from "fs";
import path from "path";
import { CreateDirectoryEvent} from "../../events/workspace";
import {WorkspaceEvent} from "../../events/workspace/event";
import {getWorkspaceRoot} from "../../workspace-path";

export function handleCreateDirectory(message: WorkspaceEvent) {
  const params = message as CreateDirectoryEvent;
  const absolutePath = path.join(getWorkspaceRoot(), ...params.path);
  if (existsSync(path.dirname(absolutePath))) {
    if (!existsSync(absolutePath)){
      mkdirSync(absolutePath);
    }
  } else {
    ensureDirectoryExistence(absolutePath);
    mkdirSync(absolutePath);
  }
}

export function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  mkdirSync(dirname);
}