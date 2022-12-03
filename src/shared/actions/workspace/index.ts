import { Topics } from "../../constants";
import { fromWire, WorkspaceEventType } from "../../events/workspace/event";
import { logger } from "../../logger";
import { handleCreateFile } from "./create-file";
import { workspace } from "vscode";
import { handleDeleteFile } from "./delete-file";
import { handleCreateDirectory } from "./create-directory";
import { handleShareFile } from "./share-file";
import { handleSyncWorkspaceRequest } from "./sync-workspace-request";
import { handleSyncWorkspaceResponse } from "./sync-workspace-response";

const workspaceActionHandlers = {
  [WorkspaceEventType.createFile]: handleCreateFile,
  [WorkspaceEventType.createDirectory]: handleCreateDirectory,
  [WorkspaceEventType.deleteFileOrDirectory]: handleDeleteFile,
  [WorkspaceEventType.shareFile]: handleShareFile,
  [WorkspaceEventType.syncWorkspaceRequest]: handleSyncWorkspaceRequest,
  [WorkspaceEventType.syncWorkspaceResponse]: handleSyncWorkspaceResponse,
};

let totalLatency = 0;
let numberOfMeasurements = 0;
const allowedTopics = new Set([Topics.workspaceUpdates, Topics.workspaceSync]);

export function handleWorkspaceEvent(
  event: any,
  config?: {
    whiteList?: WorkspaceEventType[];
    blackList?: WorkspaceEventType[];
  }
) {
  const topic = event.detail.topic;
  if (!allowedTopics.has(topic)) {
    return;
  }

  const message = fromWire(event.detail.data);

  if (config?.whiteList && !config?.whiteList.includes(message.type)) {
    return;
  }

  if (config?.blackList && config?.blackList.includes(message.type)) {
    return;
  }

  const latency = Date.now() - message.timestampForMeasurements;
  logger().info(`Latency: ${latency}ms`);

  totalLatency += latency;
  numberOfMeasurements += 1;

  logger().info(`Average Latency: ${totalLatency / numberOfMeasurements}`);

  if (WorkspaceEventType[message.type] === undefined) {
    logger().info("Received invalid workspace event", { type: message.type });
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
    timestampForMeasurements: message.timestampForMeasurements,
  });

  workspaceActionHandlers[message.type](message);
}
