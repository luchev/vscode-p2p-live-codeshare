import * as vscode from 'vscode';
import { existsSync, lstatSync, rmSync } from "fs";
import { Libp2p } from "libp2p";
import path from "path";
import { ExtensionContext, workspace } from "vscode";
import { handlePeerDiscovery } from "../actions/peer-discovery";
import { handleWorkspaceEvent } from "../actions/workspace";
import { Topics } from "../constants";
import { addCommonListeners, createNode } from "../createNode";
import {
  onFileChanged,
  onFileOrDirectoryCreated,
  onFileOrDirectoryDeleted,
} from "../listeners/workspace";
import { toHumanReadableName } from "../nameGenerator";
import { readSettingsFile, writeSettingsFile } from '../settingsHandler';
import { logger } from '../logger';


export class Peer {
  peer?: Libp2p;
  name?: string;
  isInitialized?: boolean;
  isDockerable?: boolean;
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

  async new(bootstrapAddresses?: string[]) {
    if (this.isInitialized) {
      throw new Error("Cannot initialize a peer, which is already initialized");
    }
    this.peer = await createNode({bootstrapAddresses: bootstrapAddresses});
    this.isInitialized = true;
    this.isDockerable = (await vscode.window.showInformationMessage(
      "Do you have Docker installed & running?",
      "Yes",
      "No"
    )) === 'Yes';
    return this;
  }

  /**
   * Recovers node {@link peer} based on saved parameters (peerId and port) from file {@link settingsFile}.
   * 
   * @param ctx 
   * @param bootstrapAddresses 
   * @returns 
   */
  async recover(ctx: vscode.ExtensionContext, bootstrapAddresses?: string[]) {
    if (this.isInitialized) {
      return Promise.reject("Cannot double initialize a peer");
    }

    await readSettingsFile(ctx, this.settingsFile).then(
      (peerSettings) => {
      return createNode({ peerId: peerSettings.peerId, port: peerSettings.port, bootstrapAddresses: bootstrapAddresses })
        .then(async (peer) => {
          this.peer = peer;
          this.isInitialized = true;
          this.isDockerable = (await vscode.window.showInformationMessage(
            "Do you have Docker installed & running?",
            "Yes",
            "No"
          )) === 'Yes';
          return Promise.resolve(this);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    });
  }

  async connect(ctx: vscode.ExtensionContext, bootstrapAddresses?: string[]) {
    const reconnect = (await vscode.window.showInformationMessage(
      "Do you want to reconnect to the network?",
      "Yes",
      "No"
    )) === 'Yes';

    if (reconnect) {
      return this.recover(ctx, bootstrapAddresses).then(
        (peer) => {
          return peer;
        },
        () => {
          logger().info("Unable to recover");
          return this.new(bootstrapAddresses);
        }
      );
    } else {
      return this.new(bootstrapAddresses);
    }
  }

  /**
   * Writes the peer settings (peerId and port) to file. {@link settingsFile}.
   * It assume that the {@link peer} variable is fully started, i.e. has its peerId and port.
   * @param ctx 
   */
  writeSettingsToFile(ctx: vscode.ExtensionContext) {
    const multiAddrs = this.peer!.getMultiaddrs();
    if (multiAddrs.length === 0) {
      logger().error("Peer node has no multiaddrs.");
    } else {
      const port = multiAddrs[0].nodeAddress().port;
      const peerId = this.peer!.peerId;
      writeSettingsFile(ctx, this.settingsFile, peerId, port); 
    }
  }

  initPublisher(ctx: ExtensionContext) {
    if (!this.peer) {
      return Promise.reject("Cannot init publisher before peer is started");
    }

    this.peer.addEventListener("peer:discovery", async (event) =>
      handlePeerDiscovery(event, this));

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
      handlePeerDiscovery(event, this)
    );
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

  deletePeerSettingsFile(ctx: ExtensionContext) {
    const settingsPath = path.join(ctx.extensionPath, this.settingsFile);
    if (existsSync(settingsPath)) {
      if (lstatSync(settingsPath).isFile()) {
        rmSync(settingsPath);
      }
    }
  }
}
