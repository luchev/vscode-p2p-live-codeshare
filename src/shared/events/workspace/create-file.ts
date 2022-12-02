import { WorkspaceEvent, WorkspaceEventType } from "./event";

export class CreateFileEvent implements WorkspaceEvent {
  type: WorkspaceEventType;
  path: string[];
  timestampForMeasurements: number;

  constructor(path: string[]) {
    this.type = WorkspaceEventType.createFile;
    this.path = path;
    this.timestampForMeasurements = Date.now();
  }
}
