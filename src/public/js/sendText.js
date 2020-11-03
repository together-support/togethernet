import store from '../store/index.js'
import {renderOutgoingEphemeralMessage} from './ephemeralView.js'

export const sendMessage = () => {
  const $messageInput = $('#_messageInput');
  const message = $messageInput.val();

  if (!Boolean(message)) {
    return;
  }

  const {left, top} = $('#user').position();
  if ($(`#${store.get('currentRoomId')}-${left}-${top}`).length) {
    alert("move to an empty spot to write the msg");
  } else {
    if (store.getCurrentRoom().ephemeral) {
      ephemeralSendMessage(message);
    } else {
      archivalSendMessage(message);
    }
  }

  $messageInput.val('');
}

const ephemeralSendMessage = (message) => {
  const {left, top} = $('#user').position();
  const data = {message, x: left, y: top}

  store.sendToPeers({type: 'text', data});
  store.getCurrentRoom().addEphemeralHistory({...data, ...store.getProfile()});
  renderOutgoingEphemeralMessage({...data, ...store.getProfile()});
}

const archivalSendMessage = () => {
  //       socket.emit("public message", {
  //         name: name,
  //         outgoingMsg: outgoingMsg,
  //       });
  //       archivePublicMsg(name, outgoingMsg);
  //       addPublicMsg(name, outgoingMsg);
}