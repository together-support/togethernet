import store from './store.js'
import DOMPurify from 'dompurify';

export const changeName = (name) => {
  const cleanName = DOMPurify.sanitize(name);
  if (Boolean(cleanName)) {
    store.set('name', cleanName);
  }
}

export const addPeer = (id, peer) => {
  const peers = {...store.get('peers')};
  peers[id] = peer;
  store.set('peers', peers);
}

export const getPeer = (id) => {
  const peers = {...store.get('peers')};
  return peers[id];
}

export const removePeer = (id) => {
  delete store.peers[id];
}

export const setDataChannel = (id, channel) => {
  const peer = getPeer(id);
  peer.dataChannel = channel;
}

export const addMyActivePositions = () => {
  const {x, y} = store.get('position');

  const myActivePositions = {...store.get('myActivePositions')};
  Boolean(myActivePositions[x]) ? myActivePositions[x][y] = true : myActivePositions[x] = {[y]: true};;
  store.set('myActivePositions', myActivePositions);
  addActivePositions({x, y});
}

export const addActivePositions = ({x, y}) => {
  const activePositions = {...store.get('activePositions')};
  Boolean(activePositions[x]) ? activePositions[x][y] = true : activePositions[x] = {[y]: true};
  store.set('activePositions', activePositions);
}

export const incrementMessageIndex = () => {
  const currentMessageIndex = store.get('messageIndex');
  store.set('messageIndex', currentMessageIndex + 1);
}