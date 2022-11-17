import {existsSync, writeFileSync} from "fs";
import path from "path";
import {CreateFileEvent} from "../../events/workspace";
import {WorkspaceEvent} from "../../events/workspace/event";
import {getWorkspaceRoot} from "../../workspace-path";
import { ensureDirectoryExistence } from "./create-directory";

export function handleCreateFile(message: WorkspaceEvent) {
  const params = message as CreateFileEvent;
  const absolutePath = path.join(getWorkspaceRoot(), ...params.path);
  ensureDirectoryExistence(path.dirname(absolutePath));
  if (!existsSync(absolutePath)) {
    writeFileSync(absolutePath, '');
  }
}
