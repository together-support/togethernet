import store from '@js/store';
import {addSystemMessage} from '@js/Togethernet/systemMessage';
import EphemeralMessageRecord from '@js/EphemeralMessageRecord';

export const handleData = ({event, peerId}) => {
  let data;
  try {
    data = JSON.parse(event.data);
  } catch (err) {
    console.log('invalid JSON');
  }

  if (data.type === 'text') {
    const textRecord = new EphemeralMessageRecord(data.data);
    store.getRoom(data.roomId).addEphemeralHistory(textRecord);
    textRecord.render();
  } else if (data.type === 'initPeer') {
    initPeer({...data.data});
  } else if (data.type === 'position') {
    store.getPeer(data.data.socketId).updatePosition(data.data);
  } else if (data.type === 'newRoom') {
    addNewRoom(data.data);
  } else if (data.type === 'joinedRoom') {
    const {socketId, joinedRoomId} = data.data;
    store.getPeer(socketId).joinedRoom(joinedRoomId);
  } else if (data.type === 'profileUpdated') {
    updatePeerProfile({...data.data});
  } else if (data.type === 'removeEphemeralMessage') {
    removeEphemeralPeerMessage(data.data);
  } else if (data.type === 'removeMessageInThread') {
    const {messageId} = data.data;
    $(`#textMessageContent-${messageId}`).text('[removed]');
  } else if (data.type === 'requestRooms') {
    sendRooms(peerId);
  } else if (data.type === 'shareRooms') {
    receiveRooms(data.data);
  } else if (data.type === 'setAgendaHidden') {
    setAgendaHidden(data.data);
  } else if (data.type === 'pollCreated') {
    const {roomId, textRecordId} = data.data;
    const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
    pollRecord.pollCreated();
  } else if (data.type === 'voteCasted') {
    const {roomId, textRecordId, option, socketId} = data.data;
    const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
    pollRecord.voteReceived({option, socketId});  
  } else if (data.type === 'voteRetracted') {
    const {roomId, textRecordId, option, socketId} = data.data;
    const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
    pollRecord.voteRetracted({option, socketId});
  } else if (data.type === 'voteChanged') {
    const {roomId, textRecordId, option, socketId} = data.data;
    const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
    pollRecord.voteChanged({option, socketId});
  } else if (data.type === 'updateFacilitators') {
    const {roomId, facilitators} = data.data;
    store.getRoom(roomId).updateFacilitators(facilitators);
  } else if (data.type === 'initConsentToArchiveProcess') {
    const {roomId, messageId, name} = data.data;
    const room = store.getRoom(roomId);
    const messageRecord = room.ephemeralHistory[messageId];
    messageRecord.initConsentToArchiveReceived({consentToArchiveInitiator: name});
  } else if (data.type === 'blockConsentToArchive') {
    const {roomId, messageId, name} = data.data;
    addSystemMessage(`Process stopped. \n\n ${name} would not prefer not to archive this message at the moment.`);
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
    messageRecord.messageArchived();
  } else if (data.type === 'deleteRoom') {
    const {removedRoom} = data.data;
    const room = store.rooms[removedRoom];
    room.purgeSelf();
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

const removeEphemeralPeerMessage = ({roomId, messageId}) => {
  $(`.textRecord#${messageId}`).finish().animate({opacity: 0}, {
    complete: () => {
      $(`textRecord#${messageId}`).remove();
      store.getRoom(roomId).removeEphemeralHistory(messageId);
    }
  });
};

const setAgendaHidden = ({agendaId, shouldHide}) => {
  if (shouldHide) {
    $(`#${agendaId}`).find('.textBubble').hide();
  } else {
    $(`#${agendaId}`).find('.textBubble').show();
  }
};
