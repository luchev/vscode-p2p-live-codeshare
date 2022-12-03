import { WorkspaceEvent, WorkspaceEventType } from "./event";

export class SyncWorkspaceResponseEvent implements WorkspaceEvent {
  type: WorkspaceEventType;
  path: string[];
  timestampForMeasurements: number;
  data: string;

  constructor(data: string) {
    this.type = WorkspaceEventType.syncWorkspaceResponse;
    this.path = ['/'];
    this.timestampForMeasurements = Date.now();
    this.data = data;
  }
}
