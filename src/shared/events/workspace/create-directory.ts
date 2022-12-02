import { WorkspaceEvent, WorkspaceEventType } from "./event";

export class CreateDirectoryEvent implements WorkspaceEvent {
  type: WorkspaceEventType;
  path: string[];
  timestampForMeasurements: number;

  constructor(path: string[]) {
    this.type = WorkspaceEventType.createDirectory;
    this.path = path;
    this.timestampForMeasurements = Date.now();
  }
}
