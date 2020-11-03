import store from '../store/index.js';
import {removeAllSystemMessage} from './systemMessage.js';
import {myTextRecord, textRecord} from '../components/message.js';

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