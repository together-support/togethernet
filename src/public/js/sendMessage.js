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
  Object.values(store.get('peers')).forEach(peer => {
    console.log(peer.dataChannel)
    peer.dataChannel.send(JSON.stringify({
      type: 'text',
      data: {
        sender: {
          socketId: store.get('socketId'),
          name: store.get('name'),
          avatar: store.get('avatar'),
          x: $('#user').position().left,
          y: $('#user').position().top,
        },
        message
      },
    }));
  });

  renderOutgoingEphemeralMessage(message);
}

const archivalSendMessage = () => {
  //       socket.emit("public message", {
  //         name: name,
  //         outgoingMsg: outgoingMsg,
  //       });
  //       archivePublicMsg(name, outgoingMsg);
  //       addPublicMsg(name, outgoingMsg);
}