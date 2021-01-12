import { roomModes } from '@js/constants';
import store from '@js/store';
import EphemeralMessage from './index';
import {clearSystemMessage} from '@js/Togethernet/systemMessage';

export const sendMessage = () => {
  const $messageInput = $('#writeMessage');
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
    const ephemeralMessage = new EphemeralMessage({message, messageType, left, top, threadEntryMessageId, ...store.getCurrentUser().getProfile()});
    store.getCurrentRoom().addEphemeralHistory(ephemeralMessage);
    store.sendToPeers({type: 'text', data: ephemeralMessage.messageData});
    clearSystemMessage();
    ephemeralMessage.render();
  }

  $messageInput.val('');
};