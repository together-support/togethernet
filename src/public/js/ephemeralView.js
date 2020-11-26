import store from '../store/index.js';
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