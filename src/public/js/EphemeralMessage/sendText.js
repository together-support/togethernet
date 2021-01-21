import store from '@js/store';
import EphemeralMessage from './index';

export const sendMessage = () => {
  const $messageInput = $('#writeMessage');
  const content = $messageInput.val();

  if (!content) {
    return;
  }

  const gridColumnStart = $('#user .shadow').css('grid-column-start');
  const gridRowStart = $('#user .shadow').css('grid-row-start');

  if ($(`#${store.getCurrentUser().currentRoomId}-${gridColumnStart}-${gridRowStart}`).length) {
    alert('move to an empty spot to write the msg');
  }

  const threadEntryMessageId = $('#writeMessage').attr('data-thread-entry-message');
  const isPinned = $('#pinMessage').hasClass('clicked');
  
  const ephemeralMessage = new EphemeralMessage({
    content, 
    isPinned, 
    gridColumnStart, 
    gridRowStart, 
    threadEntryMessageId, 
    ...store.getCurrentUser().getProfile()
  });

  store.getCurrentRoom().addEphemeralHistory(ephemeralMessage);
  store.sendToPeers({type: 'text', data: ephemeralMessage.messageData});
  ephemeralMessage.render();

  $messageInput.val('');
};