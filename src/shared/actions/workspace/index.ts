import { Topics } from "../../constants";
import { fromWire, WorkspaceEventType } from "../../events/workspace/event";
import { logger } from "../../logger";
import { handleCreateFile } from "./create-file";
import { workspace } from "vscode";
import { handleDeleteFile } from "./delete-file";
import {handleCreateDirectory} from "./create-directory";

const workspaceActionHandlers = {
  [WorkspaceEventType.CreateFile]: handleCreateFile,
  [WorkspaceEventType.CreateDirectory]: handleCreateDirectory,
  [WorkspaceEventType.DeleteFile]: handleDeleteFile,

  [WorkspaceEventType.ShareFile]: handleCreateDirectory,
  [WorkspaceEventType.SyncWorkspace]: handleCreateDirectory,
  [WorkspaceEventType.UpdateFile]: handleCreateDirectory,
};

function handleWorkspaceEvent(event: any) {
  const topic = event.detail.topic;
  if (topic != Topics.WorkspaceUpdates) {
    return;
  }
  let message = fromWire(event.detail.data);

  if (WorkspaceEventType[message.type] === undefined) {
    logger().info("Received invalid workspace event", {type: message.type});
    throw new Error("Invalid workspace event");
  }

  if (workspace.workspaceFolders?.[0].uri.fsPath === undefined) {
    logger().info("No active workspace. Please open a workspace first");
    throw new Error("no active workspace");
  }

  logger().info("Subscriber received workspace update", {
    topic: topic,
    path: message.path.join("/"),
    type: message.type,
  });

  workspaceActionHandlers[message.type](message);
}

export { handleWorkspaceEvent };
