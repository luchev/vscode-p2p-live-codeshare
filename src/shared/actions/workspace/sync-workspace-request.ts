import AdmZip from "adm-zip";
import { Topics } from "../../constants";
import { SyncWorkspaceResponseEvent } from "../../events/workspace";
import { toWire, WorkspaceEvent } from "../../events/workspace/event";
import { logger } from "../../logger";
import { peer } from "../../state/peer";
import {getWorkspaceRoot} from "../../workspace-path";

export function handleSyncWorkspaceRequest(_: WorkspaceEvent) {
  const zip = new AdmZip();
  zip.addLocalFolder(getWorkspaceRoot());
  const message = new SyncWorkspaceResponseEvent(zip.toBuffer().toString('base64'));

  peer()
    .p2p()
    .then((p2p) => p2p.pubsub.publish(Topics.workspaceSync, toWire(message)))
    .then(() =>
      logger().info("Emit Workspace Sync Response", {
        event: message,
      })
    )
    .catch(() =>
      logger().warn("Failed to emit Workspace Sync Response", {
        event: message,
      })
    );
}
