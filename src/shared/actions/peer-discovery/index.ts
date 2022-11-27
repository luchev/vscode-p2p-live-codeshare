import { logger } from "../../logger";
import { toHumanReadableName } from "../../nameGenerator";
import { p2pShareProvider } from '../../../sessionData';
import { Peer } from "../../entity/peer";

let _discoveredPeersMap: { [peerName: string]: Set<string> } = {};

export async function handlePeerDiscovery(event: any, peer: Peer) {
  const peerName = peer.peerName();
  if (_discoveredPeersMap[peerName] === undefined) {
    _discoveredPeersMap[peerName] = new Set();
  }

  const peerId = toHumanReadableName(event.detail.id.toString());
  if (_discoveredPeersMap[peerName].has(peerId)) {
    return;
  }

  _discoveredPeersMap[peerName].add(peerId);
  p2pShareProvider.addItem(peerId);
  p2pShareProvider.refresh();
  logger().info(`${peerName} discovered ${peerId}`);

  // Contact connected peer, to let them know, that i am dockerable.
  if (peer.isDockerable) {
    let stream = await peer.peer!.dialProtocol(event.detail.id, '/docker');
    stream.reset();
  }
}
