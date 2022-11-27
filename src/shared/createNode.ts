import { createLibp2p, Libp2p } from "libp2p";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { noise } from "@chainsafe/libp2p-noise";
import { bootstrap } from "@libp2p/bootstrap";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { logger } from "./logger";
import { Components } from "libp2p/dist/src/components";
import type { PeerDiscovery } from "@libp2p/interface-peer-discovery";
import * as vscode from "vscode";
import { Connection } from "@libp2p/interface-connection";
import { pipe } from "it-pipe";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { handleReceivedDockerContent } from "./dockerfiles-receiver";
import type { PeerId } from "@libp2p/interface-peer-id";
import { DockerFilesMessage } from "../models/DockerFilesMessage";

// export const createNode = async (bootstrapAddresses: string[]) => {
//   let peerDiscovery = [
//     pubsubPeerDiscovery({
//       interval: 100,
//     }) as (components: Components) => PeerDiscovery,
//   ];
//   if (bootstrapAddresses.length > 0) {
//     peerDiscovery.push(
//       bootstrap({
//         list: bootstrapAddresses,
//       })
//     );
//   }

export const createNode = async (props: {
  peerId?: PeerId;
  port?: number;
  bootstrapAddresses?: string[];
}) => {
  const { peerId, port, bootstrapAddresses } = props;

  const node = await createLibp2p({
    peerId: peerId,
    addresses: {
      listen: [`/ip4/0.0.0.0/tcp/${port ?? 0}`],
    },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    pubsub: gossipsub({ allowPublishToZeroPeers: true }),
    peerDiscovery: [
      pubsubPeerDiscovery({
        interval: 100, // 100ms
      }) as (components: Components) => PeerDiscovery,
      ...(bootstrapAddresses !== undefined
        ? [bootstrap({ list: bootstrapAddresses })]
        : []),
    ],
    relay: {
      advertise: { enabled: true },
      autoRelay: { enabled: true },
      enabled: true,
      hop: { enabled: true },
    },
  });
  await node.start()!.then(
    undefined,
    (error) => {
      console.log(error);
    }
  );

  logger().info("Peer started", {
    // id: peerName(),
    addresses: node
      .getMultiaddrs()
      .map((x) => x.toString()),
  });
  return node;
};

export async function addCommonListeners(
  ctx: vscode.ExtensionContext,
  node: Libp2p
) {
  node.connectionManager.addEventListener("peer:connect", async (evt) => {
    const connection = evt.detail as Connection;
    logger().info(
      `${node.peerId}: Connected to ${connection.remotePeer.toString()}`
    ); // Log connected peer
  });

  node.handle("/docker", async ({ stream, connection }) => {
    logger().info(`${node.peerId}: Peer ${connection.remotePeer.toString()} is Dockerable`); // Log discovered peer
    node.peerStore
      .tagPeer(connection.remotePeer, "dockerable")
      .then((_) => null)
      .catch((_) => null);
  });

  node.handle("/zip", async ({ stream, connection }) => {
    logger().info(`${node.peerId}: Zip files from ${connection.remotePeer}`);
    setInterval(() => {
      node.ping(connection.remotePeer);
    }, 5000);
    pipe(
      stream,
      (source) => {
        return (async function* () {
          for await (const buf of source) {
            yield uint8ArrayToString(buf.subarray());
          }
        })();
      },
      async (source) => {
        for await (const msg of source) {
          let data = JSON.parse(msg);
          if (data instanceof DockerFilesMessage) {
            handleReceivedDockerContent(ctx, uint8ArrayFromString(msg), stream);
          }
        }
      }
    );
  });
}
