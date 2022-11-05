import { createLibp2p, Libp2p } from "libp2p";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { noise } from "@chainsafe/libp2p-noise";
import { bootstrap } from "@libp2p/bootstrap";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import {logger} from "./logger";

export const createNode = async (bootstrapAddresses: string[]) => {
  const node = await createLibp2p({
    addresses: {
      listen: ["/ip4/0.0.0.0/tcp/0"],
    },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    pubsub: gossipsub({ allowPublishToZeroPeers: true }),
    peerDiscovery: [
      bootstrap({
        list: bootstrapAddresses,
      }),
      pubsubPeerDiscovery({
        interval: 1000,
      }),
    ],
  });

  await node.start();
  return node;
};

let _relay: Libp2p;

export async function relayAddresses() {
  if (_relay) {
    return _relay.getMultiaddrs().map(x => x.toString());
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
        interval: 1000,
      }),
    ],
    relay: {
      enabled: true, // Allows you to dial and accept relayed connections. Does not make you a relay.
      hop: {
        enabled: true, // Allows you to be a relay for other peers
      },
    },
  });

  await _relay.start();

  logger().info('Relay started with address', {'Addresses': _relay.getMultiaddrs().map(x => x.toString())})

  return _relay.getMultiaddrs().map(x => x.toString());
}
