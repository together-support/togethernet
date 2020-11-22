import store from '../store/index.js'
import EphemeralMessageRecord from './messageRecords/EphemeralMessageRecord.js';
import {removeAllSystemMessage} from './systemMessage.js';

export const sendMessage = () => {
  const $messageInput = $('#_messageInput');
  const message = $messageInput.val();

  if (!Boolean(message)) {
    return;
  }

  const {left, top} = $('#user').position();
  const messageType = $('#messageType option:selected').val();
  const isThreaded = messageType === 'message' && $('#messageType').data('threaded-message');
  
  if ($(`#${store.getCurrentUser().currentRoomId}-${left}-${top}`).length) {
    alert("move to an empty spot to write the msg");
  } else {
    if (store.getCurrentRoom().ephemeral) {
      ephemeralSendMessage({message, messageType, left, top, isThreaded});
    } else {
      archivalSendMessage({message, messageType});
    }
  }

  $messageInput.val('');
}

const ephemeralSendMessage = (messageData) => {
  const ephemeralMessageRecord = new EphemeralMessageRecord({...messageData, ...store.getCurrentUser().getProfile(), isMine: true});
  store.getCurrentRoom().addEphemeralHistory(ephemeralMessageRecord);
  store.sendToPeers({type: 'text', data: ephemeralMessageRecord.messageData});
  removeAllSystemMessage();
  ephemeralMessageRecord.render();
}

const archivalSendMessage = () => {
  //       socket.emit("public message", {
  //         name: name,
  //         outgoingMsg: outgoingMsg,
  //       });
  //       archivePublicMsg(name, outgoingMsg);
  //       addPublicMsg(name, outgoingMsg);
}