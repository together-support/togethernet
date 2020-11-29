import store from '../store/index.js';
import {
  removeEphemeralPeerMessage, 
  removeEphemeralPeerMessageInThread,
  renderIncomingEphemeralMessage, 
  updateFacilitators,
  setAgendaHidden,
  updatePeerRoom,
} from './ephemeralView.js';

import {
  pollCreated, 
  voteReceived,
  voteRetracted,
  voteChanged,
} from './voting.js';

import {addSystemMessage} from './systemMessage.js';

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
    store.getPeer(data.data.socketId).updatePosition(data.data)
  } else if (data.type === 'newRoom') {
    addNewRoom(data.data);
  } else if (data.type === 'joinedRoom') {
    updatePeerRoom(data.data);
  } else if (data.type === 'profileUpdated') {
    updatePeerProfile({...data.data});
  } else if (data.type === 'removeEphemeralMessage') {
    removeEphemeralPeerMessage(data.data);
  } else if (data.type === 'removeMessageInThread') {
    removeEphemeralPeerMessageInThread(data.data);
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
  } else if (data.type === 'initConsentToArchiveProcess') {
    const {roomId, messageId, name} = data.data;
    const room = store.getRoom(roomId);
    const messageRecord = room.ephemeralHistory[messageId];
    messageRecord.initConsentToArchiveReceived({consentToArchiveInitiator: name});
  } else if (data.type === 'blockConsentToArchive') {
    const {roomId, messageId, name} = data.data;
    addSystemMessage(`Process stopped. \n\n ${name} would not prefer not to archive this message at the moment.`)
    const room = store.getRoom(roomId);
    const messageRecord = room.ephemeralHistory[messageId];
    messageRecord.consentToArchiveBlocked();
  } else if (data.type === 'giveConsentToArchive') {
    const {roomId, messageId, socketId} = data.data;
    const room = store.getRoom(roomId);
    const messageRecord = room.ephemeralHistory[messageId];
    messageRecord.consentToArchiveReceived(store.getPeer(socketId));
  } else if (data.type === 'messageArchived') {
    const {roomId, messageId} = data.data;
    const room = store.getRoom(roomId);
    const messageRecord = room.ephemeralHistory[messageId];
    messageRecord.finishConsentToArchiveProcess();
  }
};

const updatePeerProfile = ({socketId, name, avatar}) => {
  const peer = store.getPeer(socketId);
  peer.updateState({name, avatar});
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
  peer.updateState({avatar, name, currentRoomId: roomId, left, top});
  store.updateOrInitializeRoom(roomId, room).addMember(peer);
};