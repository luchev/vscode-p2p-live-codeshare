import { Libp2p } from "libp2p";
import { Topics } from "../../constants";
import {
  SyncWorkspaceRequestEvent,
} from "../../events/workspace";
import { toWire } from "../../events/workspace/event";
import { logger } from "../../logger";
import { isWorkspaceSynced } from "../../state/peer";

export function onWorkspaceSyncRequested(subscriber: Libp2p) {
  const message = new SyncWorkspaceRequestEvent();

  subscriber.pubsub
    .publish(Topics.workspaceSync, toWire(message))
    .then(() =>
      logger().info("Emit Workspace Sync request", {
        event: message,
      })
    )
    .catch(() =>
      logger().warn("Failed to emit Workspace Sync request ", {
        event: message,
      })
    );

  setTimeout(() => {
    if (!isWorkspaceSynced) {
      onWorkspaceSyncRequested(subscriber);
    }
  }, 1000);
}
