import store from '../store/store.js'
import {renderOutgoingEphemeralMessage} from './ephemeral.js'

export const sendMessage = () => {
  const $messageInput = $('#_messageInput');
  const message = $messageInput.val();

  if (!Boolean(message)) {
    return;
  }

  const {left, top} = $('#user').position();
  if ($(`#${store.get('room')}-${left}-${top}`).length) {
    alert("move to an empty spot to write the msg");
  } else {
    if (store.get('room') === 'ephemeralSpace') {
      ephemeralSendMessage(message);
    } else if (store.get('room') === 'archivalSpace') {
      archivalSendMessage(message);
    }
  }

  $messageInput.val('');
}

const ephemeralSendMessage = (message) => {
  const {left, top} = $('#user').position();
  const data = {
    type: 'text', 
    data: {
      message,
      x: left,
      y: top
    }
  }

  store.sendToPeers(data);
  store.addEphemeralHistory({...data, ...store.getProfile()});
  renderOutgoingEphemeralMessage({message, ...store.getProfile()});
}

const archivalSendMessage = () => {
  //       socket.emit("public message", {
  //         name: name,
  //         outgoingMsg: outgoingMsg,
  //       });
  //       archivePublicMsg(name, outgoingMsg);
  //       addPublicMsg(name, outgoingMsg);
}