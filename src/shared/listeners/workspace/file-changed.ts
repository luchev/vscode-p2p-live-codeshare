import { constants } from "buffer";
import { Libp2p } from "libp2p";
import { TextDocumentChangeEvent } from "vscode";
import { SkipFileNames, Topics } from "../../constants";
import { ShareFileEvent } from "../../events/workspace";
import { toWire } from "../../events/workspace/event";
import { logger } from "../../logger";
import { getWorkspaceRelativePath } from "../../workspace-path";

export function onFileChanged(
  publisher: Libp2p,
  event: TextDocumentChangeEvent
) {
  if (SkipFileNames.has(event.document.fileName)) {
    return;
  }

  const message = new ShareFileEvent(
    getWorkspaceRelativePath(event.document.fileName),
    event.document.getText()
  );

  publisher.pubsub
    .publish(Topics.WorkspaceUpdates, toWire(message))
    .then(() =>
      logger().info("Emit Share File Event", {
        event: message,
      })
    )
    .catch(() =>
      logger().warn("Failed to emit Share File Event", {
        event: message,
      })
    );
}
