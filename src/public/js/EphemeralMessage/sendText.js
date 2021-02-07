import store from '@js/store';
import EphemeralMessage from './index';

export const sendMessage = () => {
  const $messageInput = $('#writeMessage');
  const content = $messageInput.val();

  if (!content) {
    return;
  }

  if (store.getCurrentRoom().constructor.isEphemeral) {
    const gridColumnStart = $('#user .shadow').css('grid-column-start');
    const gridRowStart = $('#user .shadow').css('grid-row-start');
  
    if ($(`#${store.getCurrentUser().currentRoomId}-${gridColumnStart}-${gridRowStart}`).length) {
      alert('move to an empty spot to write the msg');
    }
  
    const threadEntryMessageId = $('#writeMessage').attr('data-thread-entry-message');
    const isPinned = $('#pinMessage').hasClass('clicked') && store.getCurrentRoom().hasFacilitator(store.getCurrentUser().socketId);
    
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
    $('#pinMessage').removeClass('clicked');
  } else {
    fetch('/archive', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        author: store.getCurrentUser().getProfile().name, 
        content,
        room_id: 'archivalSpace',
        commentable_id: store.getCurrentRoom().isCommentingOnId,
        message_type: 'comment',
      })
    }).catch(e => console.log(e));
  }

  $messageInput.val('');
};