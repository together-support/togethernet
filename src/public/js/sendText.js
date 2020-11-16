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
  if ($(`#${store.get('currentRoomId')}-${left}-${top}`).length) {
    alert("move to an empty spot to write the msg");
  } else {
    if (store.getCurrentRoom().ephemeral) {
      ephemeralSendMessage({message, messageType});
    } else {
      archivalSendMessage({message, messageType});
    }
  }

  $messageInput.val('');
}

const ephemeralSendMessage = ({message, messageType}) => {
  const {left, top} = $('#user').position();
  const data = {message, messageType, x: left, y: top}

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