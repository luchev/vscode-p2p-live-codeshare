import { createLibp2p, Libp2p } from "libp2p";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { noise } from "@chainsafe/libp2p-noise";
import { bootstrap } from "@libp2p/bootstrap";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { logger } from "./logger";
import { generateName } from "./nameGenerator";
import { Components } from "libp2p/dist/src/components";
import type { PeerDiscovery } from "@libp2p/interface-peer-discovery";

export const createNode = async (bootstrapAddresses: string[]) => {
  let peerDiscovery = [
    pubsubPeerDiscovery({
      interval: 100,
    }) as (components: Components) => PeerDiscovery,
  ];
  if (bootstrapAddresses.length > 0) {
    peerDiscovery.push(
      bootstrap({
        list: bootstrapAddresses,
      })
    );
  }

  const node = await createLibp2p({
    addresses: {
      listen: ["/ip4/0.0.0.0/tcp/0"],
    },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    pubsub: gossipsub({ allowPublishToZeroPeers: true }),
    peerDiscovery: peerDiscovery,
    relay: {
      advertise: { enabled: true },
      autoRelay: { enabled: true },
      enabled: true,
      hop: { enabled: true },
    },
  });

  await node.start();
  return node;
};

let _relay: Libp2p;

// startRelay creates a 3rd node, for local testing
// So the subscriber and the peer can connect through it
// This allows testing of the auto discovery mechanism
export async function startRelay() {
  if (_relay) {
    return _relay.getMultiaddrs().map((x) => x.toString());
  }

  _relay = await createLibp2p({
    addresses: {
      listen: ["/ip4/0.0.0.0/tcp/0"],
    },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    pubsub: gossipsub({ allowPublishToZeroPeers: true }),
    peerDiscovery: [
      pubsubPeerDiscovery({
        interval: 100,
      }) as (components: Components) => PeerDiscovery,
    ],
    relay: {
      advertise: {
        enabled: true,
      },
      autoRelay: {
        enabled: true,
      },
      enabled: true, // Allows you to dial and accept relayed connections. Does not make you a relay.
      hop: {
        enabled: true, // Allows you to be a relay for other peers
      },
    },
  });

  await _relay.start();

  logger().info("Relay started", {
    addresses: _relay.getMultiaddrs().map((x) => x.toString()),
    id: generateName(_relay.peerId.toString()),
  });

  return _relay.getMultiaddrs().map((x) => x.toString());
}
