import store from '../store/index.js'
import {
  removeEphemeralPeerMessage, 
  renderIncomingEphemeralMessage, 
  initPeer, 
  updatePeerPosition, 
  updatePeerAvatar,
  updatePeerRoom
} from './ephemeralView.js'

export const handleData = ({event, peerId}) => {
  let data;
  try {
    data = JSON.parse(event.data);
  } catch (err) {
    console.log('invalid JSON');
  };

  if (data.type === 'text') {
    renderIncomingEphemeralMessage(data.data);
  } else if (data.type === 'initPeer') {
    initPeer({...data.data, id: peerId});
  } else if (data.type === 'position') {
    updatePeerPosition({...data.data, id: peerId}) 
  } else if (data.type === 'newRoom') {
    addNewRoom(data.data);
  } else if (data.type === 'joinedRoom') {
    updatePeerRoom(data.data);
  } else if (data.type === 'changeAvatar') {
    updatePeerAvatar({...data.data, id: peerId})
  } else if (data.type === 'removeEphemeralMessage') {
    removeEphemeralPeerMessage(data.data);
  } else if (data.type === 'requestRooms') {
    sendRooms(peerId);
  } else if (data.type === 'shareRooms') {
    receiveRooms(data.data);
  }
}

const sendRooms = (peerId) => {
  const dataChannel = store.getPeer(peerId).dataChannel;
  store.sendToPeer(dataChannel, {
    type: 'shareRooms',
    data: {
      rooms: store.get('rooms'),
    }
  });
}

const receiveRooms = ({rooms}) => {
  Object.keys(rooms).forEach(roomId => {
    store.updateOrInitializeRoom(roomId, rooms[roomId]);
  });

  store.getCurrentRoom().showRoom();
}

const addNewRoom = ({options}) => {
  store.updateOrInitializeRoom(options.roomId, options);
}