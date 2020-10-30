import store from './store.js'

export const addPeer = (id, peer) => {
  const peers = {...store.get('peers')};
  peers[id] = peer;
  store.set('peers', peers);
}

export const getPeer = (id) => {
  const peers = {...store.get('peers')};
  return peers[id];
}

export const setDataChannel = (id, channel) => {
  const peer = getPeer(id);
  peer.dataChannel = channel;
}

