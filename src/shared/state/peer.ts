import { Peer } from "../entity/peer";

let _isInitialized = false;
let _peer: Peer;

export function peer() {
  if (!_isInitialized) {
    _peer = new Peer();
  }
  _isInitialized = true;
  return _peer;
}
