import type { PeerId } from "@libp2p/interface-peer-id";
import { Libp2p } from "libp2p";
import { ExtensionContext, workspace } from "vscode";
import { handlePeerDiscovery } from "../actions/peer-discovery";
import {handleWorkspaceEvent} from "../actions/workspace";
import {Topics} from "../constants";
import { addCommonListeners, createNode } from "../createNode";
import {
  onFileChanged,
  onFileOrDirectoryCreated,
  onFileOrDirectoryDeleted,
} from "../listeners/workspace";
import { toHumanReadableName } from "../nameGenerator";

export class Peer {
  peer?: Libp2p;
  name?: string;
  isInitialized?: boolean;
  port?: number;
  settingsFile = 'peer_settings.json';

  constructor() {
    this.isInitialized = false;
  }

  async p2p() {
    if (!this.isInitialized) {
      return Promise.reject("Trying to use peer, which is not initialized");
    }

    return Promise.resolve(this.peer!);
  }

  isPeerSetup() {
    return this.isInitialized;
  }

  peerName() {
    if (!this.isInitialized) {
      throw new Error("Trying to use peer, which is not initialized");
    }
    return toHumanReadableName((this.peer?.peerId ?? "").toString());
  }

  async new() {
    if (this.isInitialized) {
      throw new Error("Cannot initialize a peer, which is already initialized");
    }
    this.peer = await createNode({});
    this.isInitialized = true;
  }

  async recover(peerId: PeerId, port: number, bootstrapAddresses?: string[]) {
    if (this.isInitialized) {
      return Promise.reject("Cannot double initialize a peer");
    }

    return createNode({ peerId: peerId, port: port, bootstrapAddresses })
      .then((peer) => {
        this.peer = peer;
        this.isInitialized = true;
        this.port = port;
        return Promise.resolve(this);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  initPublisher(ctx: ExtensionContext) {
    if (!this.peer) {
      return Promise.reject("Cannot init publisher before peer is started");
    }

    this.peer.addEventListener("peer:discovery", (event) =>
      handlePeerDiscovery(event, this.peerName())
    );

    workspace.onDidCreateFiles((event) =>
      onFileOrDirectoryCreated(this.peer!, event)
    );
    workspace.onDidDeleteFiles((event) =>
      onFileOrDirectoryDeleted(this.peer!, event)
    );
    workspace.onDidChangeTextDocument((event) =>
      onFileChanged(this.peer!, event)
    );

    addCommonListeners(ctx, this.peer);

    return Promise.resolve(this);
  }

  initSubscriber(ctx: ExtensionContext) {
    if (!this.peer) {
      return Promise.reject("Cannot init subscriber before peer is started");
    }

    addCommonListeners(ctx, this.peer);

    this.peer.pubsub.subscribe(Topics.workspaceUpdates);
    this.peer.addEventListener("peer:discovery", (event) =>
      handlePeerDiscovery(event, this.peerName())
    );
    this.peer.pubsub.subscribe(Topics.workspaceUpdates);
    this.peer.pubsub.addEventListener("message", (event) => {
      handleWorkspaceEvent(event);
    });

    return Promise.resolve(this);
  }


  async kill() {
    if (!this.isInitialized) {
      throw new Error("Trying to use peer, which is not initialized");
    }
    await this.peer?.stop();
    this.isInitialized = false;
  }
}
