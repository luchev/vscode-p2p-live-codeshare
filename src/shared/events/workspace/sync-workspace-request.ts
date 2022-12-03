import { WorkspaceEvent, WorkspaceEventType } from "./event";

export class SyncWorkspaceRequestEvent implements WorkspaceEvent {
  type: WorkspaceEventType;
  path: string[];
  timestampForMeasurements: number;

  constructor() {
    this.type = WorkspaceEventType.syncWorkspaceRequest;
    this.path = ['/'];
    this.timestampForMeasurements = Date.now();
  }
}
