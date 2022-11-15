export enum Topics {
  WorkspaceUpdates = "workspace_updates",
}
export const ExtensionName = "p2p-share";
export const SkipTopics = new Set(["_peer-discovery._p2p._pubsub"]);
export const SkipFileNames = new Set([
  "extension-output-undefined_publisher.p2p-share-#1-p2p-share",
]);
