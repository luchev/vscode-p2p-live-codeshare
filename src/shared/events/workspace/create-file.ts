import { WorkspaceEvent, WorkspaceEventType } from "./event";

export class CreateFileEvent implements WorkspaceEvent {
  type: WorkspaceEventType;
  path: string[];

  constructor(path: string[]) {
    this.type = WorkspaceEventType.createFile;
    this.path = path;
  }
}
