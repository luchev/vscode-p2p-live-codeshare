import { WorkspaceEvent, WorkspaceEventType } from "./event";

export class DeleteFileEvent implements WorkspaceEvent {
  type: WorkspaceEventType;
  path: string[];
  timestampForMeasurements: number;

  constructor(path: string[]) {
    this.type = WorkspaceEventType.deleteFileOrDirectory;
    this.path = path;
    this.timestampForMeasurements = Date.now();
  }
}
