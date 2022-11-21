import { Libp2p } from "libp2p";
import { Peer } from "../entity/peer";
import { toHumanReadableName } from "../nameGenerator";

let _p2pPeer: Libp2p;
let _peerName: string;
let _isDELETEMEInitialized = false;
let _isInitialized = false;
let _peer: Peer;

export function peer() {
  if (!_isInitialized) {
    _peer = new Peer();
  }
  _isInitialized = true;
  return _peer;
}
