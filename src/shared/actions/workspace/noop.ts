import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { workspace } from "vscode";
import { CreateDirectoryEvent, CreateFileEvent } from "../../events/workspace";
import {WorkspaceEvent} from "../../events/workspace/event";

export function handleNoop(message: WorkspaceEvent) {
  throw new Error('not implemented')
}
