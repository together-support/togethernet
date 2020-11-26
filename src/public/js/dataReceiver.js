import store from '../store/index.js';
import {
  removeEphemeralPeerMessage, 
  renderIncomingEphemeralMessage, 
  updateFacilitators,
  setAgendaHidden,
  updatePeerPosition, 
  updatePeerAvatar,
  updatePeerRoom,
} from './ephemeralView.js';

import {
  pollCreated, 
  voteReceived,
  voteRetracted,
  voteChanged,
} from './voting.js';

export const handleData = ({event, peerId}) => {
  let data;
  try {
    data = JSON.parse(event.data);
  } catch (err) {
    console.log('invalid JSON');
  }

  if (data.type === 'text') {
    renderIncomingEphemeralMessage(data.data);
  } else if (data.type === 'initPeer') {
    initPeer({...data.data});
  } else if (data.type === 'position') {
    updatePeerPosition({...data.data}); 
  } else if (data.type === 'newRoom') {
    addNewRoom(data.data);
  } else if (data.type === 'joinedRoom') {
    updatePeerRoom(data.data);
  } else if (data.type === 'profileUpdated') {
    updatePeerProfile({...data.data});
  } else if (data.type === 'removeEphemeralMessage') {
    removeEphemeralPeerMessage(data.data);
  } else if (data.type === 'requestRooms') {
    sendRooms(peerId);
  } else if (data.type === 'shareRooms') {
    receiveRooms(data.data);
  } else if (data.type === 'setAgendaHidden') {
    setAgendaHidden(data.data);
  } else if (data.type === 'pollCreated') {
    pollCreated(data.data);
  } else if (data.type === 'voteCasted') {
    voteReceived(data.data);
  } else if (data.type === 'voteRetracted') {
    voteRetracted(data.data);
  } else if (data.type === 'voteChanged') {
    voteChanged(data.data);
  } else if (data.type === 'updateFacilitators') {
    updateFacilitators(data.data);
  }
};

const updatePeerProfile = ({socketId, name, avatar}) => {
  const peer = store.getPeer(socketId);
  peer.profile = {socketId, name, avatar};
  updatePeerAvatar({socketId, avatar, name});
};

const sendRooms = (peerId) => {
  const dataChannel = store.getPeer(peerId).dataChannel;
  store.sendToPeer(dataChannel, {
    type: 'shareRooms',
    data: {
      rooms: store.get('rooms'),
    }
  });
};

const receiveRooms = ({rooms}) => {
  Object.keys(rooms).forEach(roomId => {
    store.updateOrInitializeRoom(roomId, rooms[roomId]);
  });
};

const addNewRoom = ({options}) => {
  store.updateOrInitializeRoom(options.roomId, options);
};

const initPeer = (data) => {
  const {socketId, avatar, name, roomId, room, left, top} = data;
  const peer = store.getPeer(socketId);
  peer.updateProfile({avatar, name, currentRoomId: roomId, left, top});
  store.updateOrInitializeRoom(roomId, room).addMember(peer);
};