import store from '../store/store.js'
import {renderOutgoingEphemeralMessage} from './ephemeral.js'

export const sendMessage = () => {
  const $messageInput = $('#_messageInput');
  const message = $messageInput.val();
  if (!store.get('allowSendMessage')) {
    alert("move to an empty spot to write the msg");
  }

  if (store.get('allowSendMessage') && Boolean(message)) {
    if (store.get('room') === 'ephemeral') {
      ephemeralSendMessage(message);
    } else if (store.get('room') === 'archival') {
      archivalSendMessage(message);
    }
  }

  $messageInput.val('');
}

const ephemeralSendMessage = (message) => {
  const data = {
    type: 'text', 
    data: {
      message,
      x: $('#user').position().left,
      y: $('#user').position().top
    }
  }

  store.sendToPeers(data);
  renderOutgoingEphemeralMessage({message, name: $('#_nameInput').text()});
}

const archivalSendMessage = () => {
  //       socket.emit("public message", {
  //         name: name,
  //         outgoingMsg: outgoingMsg,
  //       });
  //       archivePublicMsg(name, outgoingMsg);
  //       addPublicMsg(name, outgoingMsg);
}