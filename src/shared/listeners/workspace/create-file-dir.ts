import { lstatSync } from "fs";
import { Libp2p } from "libp2p";
import { FileCreateEvent } from "vscode";
import { Topics } from "../../constants";
import { CreateDirectoryEvent, CreateFileEvent } from "../../events/workspace";
import { logger } from "../../logger";
import { serialize } from "../../object-serializer";
import { getWorkspaceRelativePath } from "../../workspace-path";

export function onFileCreated(publisher: Libp2p, event: FileCreateEvent) {
  for (const file of event.files) {
    const workspaceRelativePath = getWorkspaceRelativePath(file.fsPath);
    const isFile = lstatSync(file.fsPath).isFile();
    if (isFile) {
      publisher.pubsub
        .publish(
          Topics.WorkspaceUpdates,
          serialize(new CreateFileEvent(workspaceRelativePath))
        )
        .then(() =>
          logger().info("Emit Create File Event", {
            path: workspaceRelativePath,
          })
        )
        .catch(() =>
          logger().warn("Failed to publish creation of new file", {
            path: workspaceRelativePath,
          })
        );
    } else {
      publisher.pubsub
        .publish(
          Topics.WorkspaceUpdates,
          serialize(new CreateDirectoryEvent(workspaceRelativePath))
        )
        .then(() =>
          logger().info("Emit Create Directory Event", {
            path: workspaceRelativePath,
          })
        )
        .catch(() =>
          logger().warn("Failed to publish creation of new file", {
            path: workspaceRelativePath,
          })
        );
    }
  }
}
