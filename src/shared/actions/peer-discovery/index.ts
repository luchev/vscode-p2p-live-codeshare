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

  // what is event.detail.id
  const peerId = toHumanReadableName(event.detail.id.toString());
  if (_discoveredPeersMap[peerName].has(peerId)) {
    return;
  }

  _discoveredPeersMap[peerName].add(peerId);

  // add new peer to tree view (and check if all known peers are in tree view/sidebar)
  peer.peer!.peerStore.forEach( (libpeer) => {
        const peerLabel = toHumanReadableName(libpeer.id.toString());
        const addresses : string[] = [];
        libpeer.addresses.forEach(
          (multiaddr) => {
            const stringAddress = multiaddr.multiaddr.toString();
            if(stringAddress.includes(event.detail.id.toString())) {
              addresses.push(stringAddress);
            }
          });
        if (!p2pShareProvider.findPeerDataByLabel(peerLabel)) {
          p2pShareProvider.addItem(peerLabel, addresses.concat([libpeer.id.toString(), peer.isDockerable ? "Dockerable" : "Not dockerable"]));
        }
      }
  );
  logger().info(`${peerName} discovered ${peerId}`);

  // Contact connected peer, to let them know, that i am dockerable.
  if (peer.isDockerable) {
    let stream = await peer.peer!.dialProtocol(event.detail.id, '/docker');
    stream.reset();
  }
}
