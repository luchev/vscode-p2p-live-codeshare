import { existsSync, writeFileSync } from "fs";
import path from "path";
import { workspace } from "vscode";
import { ShareFileEvent } from "../../events/workspace";
import {WorkspaceEvent} from "../../events/workspace/event";
import {getWorkspaceRoot} from "../../workspace-path";

export function handleShareFile(message: WorkspaceEvent) {
  const params = message as ShareFileEvent;
  const absolutePath = path.join(getWorkspaceRoot(), ...params.path);
  writeFileSync(absolutePath, params.content);
}
