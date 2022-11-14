import { Libp2p } from "libp2p";
import { FileDeleteEvent } from "vscode";
import { Topics } from "../../constants";
import { DeleteFileEvent } from "../../events/workspace";
import { logger } from "../../logger";
import {serialize} from "../../object-serializer";
import { getWorkspaceRelativePath } from "../../workspace-path";

export function onFileDeleted(publisher: Libp2p, event: FileDeleteEvent) {
  for (const file of event.files) {
    const workspaceRelativePath = getWorkspaceRelativePath(file.fsPath);
    publisher.pubsub
      .publish(
        Topics.WorkspaceUpdates,
        serialize(new DeleteFileEvent(workspaceRelativePath))
      )
      .then(() =>
        logger().info("Emit Delete File Event", {
          path: workspaceRelativePath,
        })
      )
      .catch(() =>
        logger().warn("Failed to publish creation of new file", {
          path: file.fsPath,
        })
      );
  }
}
