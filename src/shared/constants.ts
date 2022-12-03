export enum Topics {
  workspaceUpdates = "workspace_updates",
  workspaceSync = "workspace_sync",
}
export const extensionName = "colab";
export const skipTopics = new Set(["_peer-discovery._p2p._pubsub"]);
export const skipFileNames = new Set([
  "extension-output-undefined_publisher.colab-#1-colab",
]);
