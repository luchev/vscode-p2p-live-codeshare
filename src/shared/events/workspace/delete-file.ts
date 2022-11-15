import { WorkspaceEvent, WorkspaceEventType } from "./event";

export class DeleteFileEvent implements WorkspaceEvent {
  type: WorkspaceEventType;
  path: string[];

  constructor(path: string[]) {
    this.type = WorkspaceEventType.DeleteFileOrDirectory;
    this.path = path;
  }
}
