import { lstatSync } from "fs";
import { Libp2p } from "libp2p";
import { FileCreateEvent } from "vscode";
import { Topics } from "../../constants";
import { CreateDirectoryEvent, CreateFileEvent } from "../../events/workspace";
import {toWire} from "../../events/workspace/event";
import { logger } from "../../logger";
import { getWorkspaceRelativePath } from "../../workspace-path";

export function onFileOrDirectoryCreated(
  publisher: Libp2p,
  event: FileCreateEvent
) {
  for (const file of event.files) {
    const workspaceRelativePath = getWorkspaceRelativePath(file.fsPath);
    
    const isFile = lstatSync(file.fsPath).isFile();
    if (isFile) {
      publisher.pubsub
        .publish(
          Topics.WorkspaceUpdates,
          toWire(new CreateFileEvent(workspaceRelativePath))
        )
        .then(() =>
          logger().info("Emit Create File Event", {
            path: workspaceRelativePath,
          })
        )
        .catch(() =>
          logger().warn("Failed to emit Create File Event", {
            path: workspaceRelativePath,
          })
        );
    } else {
      publisher.pubsub
        .publish(
          Topics.WorkspaceUpdates,
          toWire(new CreateDirectoryEvent(workspaceRelativePath))
        )
        .then(() =>
          logger().info("Emit Create Directory Event", {
            path: workspaceRelativePath,
          })
        )
        .catch(() =>
          logger().warn("Failed to emit Create Directory Event", {
            path: workspaceRelativePath,
          })
        );
    }
  }
}
