import { WorkspaceEvent, WorkspaceEventType } from "./event";

export class ShareFileEvent implements WorkspaceEvent {
  type: WorkspaceEventType;
  path: string[];
  content: string;

  constructor(path: string[], content: string) {
    this.type = WorkspaceEventType.shareFile;
    this.path = path;
    this.content = content;
  }
}
