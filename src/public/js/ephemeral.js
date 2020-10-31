import store from '../store/store.js';
import {removeAllSystemMessage} from './systemMessage.js';
import {myTextRecord} from '../components/message.js';

export const renderOutgoingEphemeralMessage = (data) => {
  removeAllSystemMessage();
  const outgoingMessage = myTextRecord(data)
  outgoingMessage.appendTo($(`#${store.get('room')}`));
}

export const removeMessage = (event) => {
  event.preventDefault();
  const $messageRecord = $(event.target).parent().parent();
  $messageRecord.finish().animate({opacity: 0}, {
    complete: () => {
      $messageRecord.remove();
      store.sendToPeers({
        type: 'removeEphemeralMessage',
        data: {
          messageId: $messageRecord.attr('id')
        }
      });
    }
  });  
};