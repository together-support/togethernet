import store from '../store/index.js';
import {removeAllSystemMessage} from './systemMessage.js';
import {disappearingTextRecord, persistentTextRecord, agendaTextRecord} from '../components/message.js';
import {peerAvatar} from '../components/users.js';

export const renderOutgoingEphemeralMessage = (data) => {
  removeAllSystemMessage();
  renderMessageRecord({...data, isMine: true}).appendTo(store.getCurrentRoom().$room);
}

export const renderIncomingEphemeralMessage = (data) => {
  store.getRoom(data.roomId).addEphemeralHistory(data);
  renderMessageRecord(data).appendTo(store.getRoom(data.roomId).$room);
}

const renderMessageRecord = (data) => {
  if (data.messageType === 'agenda') {
    return agendaTextRecord(data)
  } else if (data.messageType === 'message') {
    return disappearingTextRecord(data);
  } else {
    return persistentTextRecord(data);
  }
}

export const removeMessage = (event) => {
  event.preventDefault();
  const $messageRecord = $(event.target).closest('.textRecord');
  $messageRecord.finish().animate({opacity: 0}, {
    complete: () => {
      $messageRecord.remove();
      store.sendToPeers({
        type: 'removeEphemeralMessage',
        data: {messageId: $messageRecord.attr('id')}
      });
      store.getCurrentRoom().removeEphemeralHistory($messageRecord.attr('id'));
    }
  });  
};

export const hideAgendaForPeers = ({agendaId, shouldHide}) => {
  store.sendToPeers({
    type: 'setAgendaHidden',
    data: {agendaId, shouldHide}
  });
};

export const setAgendaHidden = ({agendaId, shouldHide}) => {
  if (shouldHide) {
    $(`#${agendaId}`).find('.textBubble').hide();
  } else {
    $(`#${agendaId}`).find('.textBubble').show();
  }
}

export const removeEphemeralPeerMessage = ({roomId, messageId}) => {
  $(`.textRecord#${messageId}`).finish().animate({opacity: 0}, {
    complete: () => {
      $(`textRecord#${messageId}`).remove();
      store.get(roomId).removeEphemeralHistory(messageId);
    }
  })
}

export const renderPeer = (data) => {
  peerAvatar(data).appendTo($(`#${data.roomId}`));
}

export const updatePeerPosition = ({id, x, y}) => {
  $(`#peer-${id}`).finish().animate({left: x, top: y})
}

export const updatePeerAvatar = ({id, avatar}) => {
  $(`#peer-${id}`).finish().animate({backgroundColor: avatar});
}

export const updatePeerRoom = ({socketId, joinedRoomId}) => {
  $(`#peer-${socketId}`).finish().animate({opacity: 0}, {
    complete: () => {
      $(`#peer-${socketId}`).appendTo(store.getRoom(joinedRoomId).$room);
      $(`#peer-${socketId}`).css({
        left: 0,
        top: 0,
        opacity: 1
      });
    }
  });
}