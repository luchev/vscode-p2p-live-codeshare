export enum Topics {
  ChangeFile = "change_file",
  CreateFile = "create_file",
  WorkspaceUpdates = "workspace_updates",
}

export const ExtensionName = "p2p-share";
export const SkipTopics = new Set(["_peer-discovery._p2p._pubsub"]);
