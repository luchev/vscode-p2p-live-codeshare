import { lstatSync } from "fs";
import { Libp2p } from "libp2p";
import { FileCreateEvent } from "vscode";
import { Topics } from "../../constants";
import { CreateDirectoryEvent, CreateFileEvent } from "../../events/workspace";
import { toWire } from "../../events/workspace/event";
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
      const message = new CreateFileEvent(workspaceRelativePath);

      publisher.pubsub
        .publish(Topics.WorkspaceUpdates, toWire(message))
        .then(() =>
          logger().info("Emit Create File Event", {
            event: message,
          })
        )
        .catch(() =>
          logger().warn("Failed to emit Create File Event", {
            event: message,
          })
        );
    } else {
      const message = new CreateDirectoryEvent(workspaceRelativePath);

      publisher.pubsub
        .publish(Topics.WorkspaceUpdates, toWire(message))
        .then(() =>
          logger().info("Emit Create Directory Event", {
            event: message,
          })
        )
        .catch(() =>
          logger().warn("Failed to emit Create Directory Event", {
            event: message,
          })
        );
    }
  }
}
