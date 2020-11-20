import store from '../store/index.js';
import {removeAllSystemMessage} from './systemMessage.js';
import {disappearingTextRecord, persistentTextRecord, agendaTextRecord} from '../components/message.js';
import {peerAvatar, userAvatar, makeFacilitatorButton} from '../components/users.js';
import {makeDraggableUser} from './animatedAvatar.js';
import merge from 'lodash/merge';
import { divide } from 'lodash';

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

export const renderAvatar = (data) => {
  if (store.isMe(data.socketId)) {
    renderUserAvatar();
  } else {
    renderPeer(data);
  }
}

const renderPeer = (data) => {
  const {roomId, socketId} = data;
  const $avatar = $(`#peer-${socketId}`).length ? $(`#peer-${socketId}`) : peerAvatar(data);
  
  const room = store.getRoom(roomId);
  if (room.hasFeature('facilitators') && room.hasFacilitator(store.get('socketId')) && !room.hasFacilitator(socketId)) {
    makeFacilitatorButton(room.onTransferFacilitator).appendTo($avatar);
  }
  $avatar.appendTo($(`#${roomId}`));
}

const renderUserAvatar = () => {
  if ($('#user').length) {
    $('#user').appendTo(store.getCurrentRoom().$room);
  } else {
    userAvatar().appendTo(store.getCurrentRoom().$room);
    store.set('avatarSize', $("#user").width());
    makeDraggableUser();
  }
}

export const updatePeerPosition = ({socketId, x, y, roomId}) => {
  merge(store.getRoom(roomId).members[socketId], {x, y});
  $(`#peer-${socketId}`).finish().animate({left: x, top: y})
}

export const updatePeerAvatar = ({socketId, avatar}) => {
  $(`#peer-${socketId}`).finish().animate({backgroundColor: avatar});
}

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
}

export const updateFacilitators = ({roomId, facilitators}) => {
  console.log(facilitators)
  store.getRoom(roomId).updateFacilitators(facilitators);
}