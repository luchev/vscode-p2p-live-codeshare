import {serialize} from "v8";
import {deserialize} from "../../object-serializer";
import {CreateDirectoryEvent} from "./create-directory";
import {CreateFileEvent} from "./create-file";
import {DeleteFileEvent} from "./delete-file";

export enum WorkspaceEventType {
    CreateFile,
    CreateDirectory,
    DeleteFile,
    ShareFile,
    UpdateFile,
    SyncWorkspace,
}

export interface WorkspaceEvent {
    type: WorkspaceEventType;
}

export function fromWire(bytes: any) {
    const event = deserialize<WorkspaceEvent>(bytes);
    switch (event.type) {
        case WorkspaceEventType.CreateDirectory:
            return event as CreateDirectoryEvent;
        case WorkspaceEventType.CreateFile:
            return event as CreateFileEvent;
        case WorkspaceEventType.DeleteFile:
            return event as DeleteFileEvent;
        default:
            throw new Error(`unexpected event type: ${event.type}`)
    }
}

export function toWire(event: WorkspaceEvent) {
    return serialize(event);
}
