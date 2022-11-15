import {deserialize, serialize} from "../../object-serializer";
import {CreateDirectoryEvent} from "./create-directory";
import {CreateFileEvent} from "./create-file";
import {DeleteFileEvent} from "./delete-file";
import {ShareFileEvent} from "./share-file";

export enum WorkspaceEventType {
    createFile,
    createDirectory,
    deleteFileOrDirectory,
    shareFile,
    updateFile,
    syncWorkspace,
}

export interface WorkspaceEvent {
    type: WorkspaceEventType;
}

export function fromWire(bytes: any) {
    const event = deserialize<WorkspaceEvent>(bytes);
    switch (event.type) {
        case WorkspaceEventType.createDirectory:
            return event as CreateDirectoryEvent;
        case WorkspaceEventType.createFile:
            return event as CreateFileEvent;
        case WorkspaceEventType.deleteFileOrDirectory:
            return event as DeleteFileEvent;
        case WorkspaceEventType.shareFile:
            return event as ShareFileEvent;
        default:
            throw new Error(`unexpected event type: ${event.type}`);
    }
}

export function toWire(event: WorkspaceEvent) {
    return serialize(event);
}
