import { Libp2p } from "libp2p";
import { TextDocumentChangeEvent } from "vscode";
import { Topics } from "../../constants";
import { ShareFileEvent } from "../../events/workspace";
import { toWire } from "../../events/workspace/event";
import { logger } from "../../logger";
import { getWorkspaceRelativePath } from "../../workspace-path";

export function onFileChanged(
  publisher: Libp2p,
  event: TextDocumentChangeEvent
) {
  if (
    event.document.fileName ==
    "extension-output-undefined_publisher.p2p-share-#1-p2p-share"
  ) {
    return;
  }

  const workspaceRelativePath = getWorkspaceRelativePath(
    event.document.fileName
  );

  publisher.pubsub
    .publish(
      Topics.WorkspaceUpdates,
      toWire(
        new ShareFileEvent(workspaceRelativePath, event.document.getText())
      )
    )
    .then(() =>
      logger().info("Emit Share File Event", {
        path: workspaceRelativePath,
      })
    )
    .catch(() =>
      logger().warn("Failed to emit Share File Event", {
        path: workspaceRelativePath,
      })
    );
}
