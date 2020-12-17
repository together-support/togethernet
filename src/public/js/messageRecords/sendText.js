import { roomModes } from '../constants.js';
import store from '../store/index.js';
import EphemeralMessageRecord from './EphemeralMessageRecord.js';
import {clearSystemMessage} from '../Togethernet/systemMessage.js';

export const sendMessage = () => {
  const $messageInput = $('#_messageInput');
  const message = $messageInput.val();

  if (!message) {
    return;
  }

  const left = Math.round($('#user').position().left);
  const top = Math.round($('#user').position().top);
  let messageType = $('#messageType option:selected').val();
  
  const threadEntryMessageId = $('#messageType').attr('data-thread-entry-message');
  if (messageType === 'message' && Boolean(threadEntryMessageId) && store.getCurrentRoom().mode === roomModes.egalitarian) {
    messageType = 'threadedMessage';
  }
  
  if ($(`#${store.getCurrentUser().currentRoomId}-${left}-${top}`).length) {
    alert('move to an empty spot to write the msg');
  } else {
    const ephemeralMessageRecord = new EphemeralMessageRecord({message, messageType, left, top, threadEntryMessageId, ...store.getCurrentUser().getProfile()});
    store.getCurrentRoom().addEphemeralHistory(ephemeralMessageRecord);
    store.sendToPeers({type: 'text', data: ephemeralMessageRecord.messageData});
    clearSystemMessage();
    ephemeralMessageRecord.render();
  }

  $messageInput.val('');
};