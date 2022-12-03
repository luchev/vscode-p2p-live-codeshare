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

export let isWorkspaceSynced: boolean = false;

export function setWorkspaceSynced(value: boolean) {
  isWorkspaceSynced = value;
}
