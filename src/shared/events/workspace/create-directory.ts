import { WorkspaceEvent, WorkspaceEventType } from "./event";

export class CreateDirectoryEvent implements WorkspaceEvent {
  type: WorkspaceEventType;
  path: string[];

  constructor(path: string[]) {
    this.type = WorkspaceEventType.createDirectory;
    this.path = path;
  }
}
