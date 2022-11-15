import { logger } from "../../logger";
import { toHumanReadableName } from "../../nameGenerator";

let _discoveredPeersMap: { [peerName: string]: Set<string> } = {};

export function handlePeerDiscovery(event: any, peerName: string) {
  if (_discoveredPeersMap[peerName] === undefined) {
    _discoveredPeersMap[peerName] = new Set();
  }

  const peerId = toHumanReadableName(event.detail.id.toString());
  if (_discoveredPeersMap[peerName].has(peerId)) {
    return;
  }

  _discoveredPeersMap[peerName].add(peerId);
  logger().info(`${peerName} discovered ${peerId}`);
}
