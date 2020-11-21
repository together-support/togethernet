import store from '../store/index.js'
import {renderOutgoingEphemeralMessage} from './ephemeralView.js'

export const sendMessage = () => {
  const $messageInput = $('#_messageInput');
  const message = $messageInput.val();

  if (!Boolean(message)) {
    return;
  }

  const {left, top} = $('#user').position();
  const messageType = $('#messageType option:selected').val();
  const isThreaded = messageType === 'message' && $('#messageType').data('threaded-message');
  
  // let threadStart;
  // if (isThreaded) {
  //   threadStart = 
  // }

  if ($(`#${store.get('currentRoomId')}-${left}-${top}`).length) {
    alert("move to an empty spot to write the msg");
  } else {
    if (store.getCurrentRoom().ephemeral) {
      ephemeralSendMessage({message, messageType, x: left, y: top, isThreaded});
    } else {
      archivalSendMessage({message, messageType});
    }
  }

  $messageInput.val('');
}

const ephemeralSendMessage = (message) => {
  const data = store.getCurrentRoom().addEphemeralHistory({
    ...message, 
    ...store.currentUser.getProfile(), 
    roomId: store.get('currentRoomId')
  });
  store.sendToPeers({type: 'text', data});
  renderOutgoingEphemeralMessage(data);
}

const archivalSendMessage = () => {
  //       socket.emit("public message", {
  //         name: name,
  //         outgoingMsg: outgoingMsg,
  //       });
  //       archivePublicMsg(name, outgoingMsg);
  //       addPublicMsg(name, outgoingMsg);
}