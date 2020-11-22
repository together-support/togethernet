import store from '../store/index.js';
import {peerAvatar, makeFacilitatorButton} from '../components/users.js';
import merge from 'lodash/merge';
import EphemeralTextRecord from './messageRecords/EphemeralMessageRecord.js';

export const renderIncomingEphemeralMessage = (data) => {
  const textRecord = new EphemeralTextRecord(data);
  store.getRoom(data.roomId).addEphemeralHistory(textRecord);
  textRecord.render();
};

export const setAgendaHidden = ({agendaId, shouldHide}) => {
  if (shouldHide) {
    $(`#${agendaId}`).find('.textBubble').hide();
  } else {
    $(`#${agendaId}`).find('.textBubble').show();
  }
};

export const removeEphemeralPeerMessage = ({roomId, messageId}) => {
  $(`.textRecord#${messageId}`).finish().animate({opacity: 0}, {
    complete: () => {
      $(`textRecord#${messageId}`).remove();
      store.get(roomId).removeEphemeralHistory(messageId);
    }
  });
};

export const renderAvatarInRoom = (data) => {
  if (store.getCurrentUser().isMe(data.socketId)) {
    store.getCurrentUser().currentRoomId = data.roomId;
    store.getCurrentUser().render();
  } else {
    renderPeer(data);
  }
};

const renderPeer = (data) => {
  const {roomId, socketId} = data;
  const $avatar = $(`#peer-${socketId}`).length ? $(`#peer-${socketId}`) : peerAvatar(data);
  
  const room = store.getRoom(roomId);
  if (room.hasFeature('facilitators') && room.hasFacilitator(store.getCurrentUser().socketId) && !room.hasFacilitator(socketId)) {
    makeFacilitatorButton(room.onTransferFacilitator).appendTo($avatar);
  }
  $avatar.appendTo($(`#${roomId}`));
};

export const updatePeerPosition = ({socketId, left, top, roomId}) => {
  merge(store.getRoom(roomId).members[socketId], {left, top});
  $(`#peer-${socketId}`).finish().animate({left, top});
};

export const updatePeerAvatar = ({socketId, avatar}) => {
  $(`#peer-${socketId}`).finish().animate({backgroundColor: avatar});
};

export const updatePeerRoom = (data) => {
  const {socketId, joinedRoomId} = data;
  $(`#peer-${socketId}`).finish().animate({opacity: 0}, {
    complete: () => {
      store.getRoom(joinedRoomId).addMember(data);
      $(`#peer-${socketId}`).css({
        left: 0,
        top: 0,
        opacity: 1
      });
    }
  });
};

export const updateFacilitators = ({roomId, facilitators}) => {
  store.getRoom(roomId).updateFacilitators(facilitators);
};