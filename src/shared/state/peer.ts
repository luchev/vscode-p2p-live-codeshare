import { Libp2p } from "libp2p";
import {toHumanReadableName} from "../nameGenerator";

let _peer: Libp2p;
let _peerName: string;
let _isInitialized = false;

export function peer() {
  if (!_isInitialized) {
    throw new Error('Trying to use peer, which is not initialized');
  }
  return _peer;
}

export function isPeerSetup() {
  return _isInitialized;
}

export function peerName() {
  if (!_isInitialized) {
    throw new Error('Trying to use peer, which is not initialized');
  }
  return _peerName
}

export function setPeer(peer: Libp2p) {
  if (_isInitialized) {
    throw new Error('Trying to initialize peer a second time');
  }
  _peer = peer;
  _peerName = toHumanReadableName(peer.peerId.toString())
  _isInitialized = true;
}
