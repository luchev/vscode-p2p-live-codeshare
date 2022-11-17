import {existsSync, writeFileSync} from "fs";
import path from "path";
import {CreateFileEvent} from "../../events/workspace";
import { CreateDirectoryEvent } from "../../events/workspace/create-directory";
import {WorkspaceEvent} from "../../events/workspace/event";
import {getWorkspaceRoot} from "../../workspace-path";
import { handleCreateDirectory } from "./create-directory";

export function handleCreateFile(message: WorkspaceEvent) {
  const params = message as CreateFileEvent;
  const absolutePath = path.join(getWorkspaceRoot(), ...params.path);

  if (!existsSync(path.dirname(absolutePath))) {
    if (!existsSync(absolutePath)){
      writeFileSync(absolutePath, '');
    }
  } else {
    handleCreateDirectory(new CreateDirectoryEvent(path.dirname(absolutePath).split(path.sep)));
    writeFileSync(absolutePath, '');
  }
}
