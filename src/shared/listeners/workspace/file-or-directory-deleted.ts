import { Libp2p } from "libp2p";
import { FileDeleteEvent } from "vscode";
import { Topics } from "../../constants";
import { DeleteFileEvent } from "../../events/workspace";
import {toWire} from "../../events/workspace/event";
import { logger } from "../../logger";
import { getWorkspaceRelativePath } from "../../workspace-path";

export function onFileOrDirectoryDeleted(
  publisher: Libp2p,
  event: FileDeleteEvent
) {
  for (const file of event.files) {
    const workspaceRelativePath = getWorkspaceRelativePath(file.fsPath);
    const message = new DeleteFileEvent(workspaceRelativePath);

    publisher.pubsub
      .publish(
        Topics.workspaceUpdates,
        toWire(message)
      )
      .then(() =>
        logger().info("Emit Delete File/Directory Event", {
          event: message,
        })
      )
      .catch(() =>
        logger().warn("Failed to emit Delete File/Directory Event ", {
          event: message,
        })
      );
  }
}
