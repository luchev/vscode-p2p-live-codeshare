import { WorkspaceEvent, WorkspaceEventType } from "./event";

export class CreateFileEvent implements WorkspaceEvent {
  type: WorkspaceEventType;
  path: string[];

  constructor(path: string[]) {
    this.type = WorkspaceEventType.CreateFile;
    this.path = path;
  }
}
