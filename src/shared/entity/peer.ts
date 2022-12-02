import * as vscode from 'vscode';
import type { PeerId } from "@libp2p/interface-peer-id";
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
import {Stream} from '@libp2p/interface-connection';
import { logger } from '../logger';


export class Peer {
  peer?: Libp2p;
  name?: string;
  isInitialized?: boolean;
  isDockerable?: boolean;
  settingsFile = 'peer_settings.json';
  currentDockerPeerStream?: Stream;

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
    this.isDockerable = (await vscode.window.showInformationMessage(
      "Do you have Docker installed & running?",
      "Yes",
      "No"
    )) === 'Yes';
    return this;
  }

  async recover(peerId: PeerId, port: number, bootstrapAddresses?: string[]) {
    if (this.isInitialized) {
      return Promise.reject("Cannot double initialize a peer");
    }

    return createNode({ peerId: peerId, port: port, bootstrapAddresses })
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
    this.peer.pubsub.subscribe(Topics.workspaceUpdates);
    this.peer.pubsub.addEventListener("message", (event) => {
      const latency = Date.now() - event.detail.data.timestampForMeasurements;
      logger().info(`Latency: ${latency}ms`);
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
