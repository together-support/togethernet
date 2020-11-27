import store from '../store/index.js';
import EphemeralMessageRecord from './messageRecords/EphemeralMessageRecord.js';
import {clearSystemMessage} from './systemMessage.js';

export const sendMessage = () => {
  const $messageInput = $('#_messageInput');
  const message = $messageInput.val();

  if (!message) {
    return;
  }

  const {left, top} = $('#user').position();
  let messageType = $('#messageType option:selected').val();
  
  const threadPreviousMessageId = $('#messageType').attr('data-threaded-previous-message')
  if (messageType === 'message' && Boolean(threadPreviousMessageId)) {
    messageType = 'threadedMessage';
  }
  
  if ($(`#${store.getCurrentUser().currentRoomId}-${left}-${top}`).length) {
    alert('move to an empty spot to write the msg');
  } else {
    const ephemeralMessageRecord = new EphemeralMessageRecord({message, messageType, left, top, threadPreviousMessageId, ...store.getCurrentUser().getProfile()});
    store.getCurrentRoom().addEphemeralHistory(ephemeralMessageRecord);
    store.sendToPeers({type: 'text', data: ephemeralMessageRecord.messageData});
    clearSystemMessage();
    ephemeralMessageRecord.render();
  }

  $messageInput.val('');
};