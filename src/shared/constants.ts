export enum Topics {
  workspaceUpdates = "workspace_updates",
}
export const extensionName = "p2p-share";
export const skipTopics = new Set(["_peer-discovery._p2p._pubsub"]);
export const skipFileNames = new Set([
  "extension-output-undefined_publisher.p2p-share-#1-p2p-share",
]);
