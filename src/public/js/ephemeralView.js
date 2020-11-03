import store from '../store/index.js';
import {removeAllSystemMessage} from './systemMessage.js';
import {myTextRecord, textRecord} from '../components/message.js';
import {peerAvatar} from '../components/users.js';

export const renderOutgoingEphemeralMessage = (data) => {
  removeAllSystemMessage();
  const outgoingMessage = myTextRecord(data);
  outgoingMessage.appendTo(store.getCurrentRoom().$room);
}

export const renderIncomingEphemeralMessage = ({x, y, name, avatar, message, roomId}) => {
  textRecord({x, y, name, avatar, message, roomId}).appendTo(store.getRoom(roomId).$room);
  store.getRoom(roomId).addEphemeralHistory({x, y, name, avatar, message, roomId});
}

export const removeMessage = (event) => {
  event.preventDefault();
  const $messageRecord = $(event.target).parent().parent();
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

export const removeEphemeralPeerMessage = ({roomId, messageId}) => {
  $(`.textRecord#${messageId}`).finish().animate({opacity: 0}, {
    complete: () => {
      $(`textRecord#${messageId}`).remove();
      store.get(roomId).removeEphemeralHistory(messageId);
    }
  })
}

export const initPeer = (data) => {
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