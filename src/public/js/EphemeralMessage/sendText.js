import store from '@js/store';
import EphemeralMessage from './index';

export const sendMessage = () => {
  const $messageInput = $('#writeMessage');
  const message = $messageInput.val();

  if (!message) {
    return;
  }

  const columnStart = $('#user .shadow').css('grid-column-start');
  const rowStart = $('#user .shadow').css('grid-row-start');

  if ($(`#${store.getCurrentUser().currentRoomId}-${columnStart}-${rowStart}`).length) {
    alert('move to an empty spot to write the msg');
  }

  const threadEntryMessageId = $('#writeMessage').attr('data-thread-entry-message');
  const isPinned = $('#pinMessage').hasClass('clicked');
  
  const ephemeralMessage = new EphemeralMessage({
    message, 
    isPinned, 
    columnStart, 
    rowStart, 
    threadEntryMessageId, 
    ...store.getCurrentUser().getProfile()
  });

  store.getCurrentRoom().addEphemeralHistory(ephemeralMessage);
  store.sendToPeers({type: 'text', data: ephemeralMessage.messageData});
  ephemeralMessage.render();

  $messageInput.val('');
};