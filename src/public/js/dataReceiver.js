import {peerAvatar} from '../components/users.js';
import store from '../store/index.js'
import {renderIncomingEphemeralMessage} from './ephemeral.js'

export const handleData = ({event, peerId}) => {
  let data;
  try {
    data = JSON.parse(event.data);
  } catch (err) {
    console.log('invalid JSON');
  };

  if (data.type === 'text') {
    renderIncomingEphemeralMessage(data.data);
  } else if (data.type === 'initPeer') {
    initPeer({...data.data, id: peerId});
  } else if (data.type === 'position') {
    updatePeerPosition({...data.data, id: peerId})
  } else if (data.type === 'changeAvatar') {
    updatePeerAvatar({...data.data, id: peerId})
  } else if (data.type === 'removeEphemeralMessage') {
    removeEphemeralPeerMessage(data.data);
  } else if (data.type === 'requestRooms') {
    sendRooms(peerId);
  } else if (data.type === 'shareRooms') {
    receiveRooms(data.data);
  }
}

const initPeer = (data) => {
  peerAvatar(data).appendTo($(`#${data.roomId}`));
}

const updatePeerPosition = ({id, x, y}) => {
  $(`#peer-${id}`).finish().animate({left: x, top: y})
}

const updatePeerAvatar = ({id, avatar}) => {
  $(`#peer-${id}`).finish().animate({backgroundColor: avatar});
}

const removeEphemeralPeerMessage = ({roomId, messageId}) => {
  $(`.textRecord#${messageId}`).finish().animate({opacity: 0}, {
    complete: () => {
      $(`textRecord#${messageId}`).remove();
      store.get(roomId).removeEphemeralHistory(messageId);
    }
  })
}

const sendRooms = (peerId) => {
  const dataChannel = store.getPeer(peerId).dataChannel;
  store.sendToPeer(dataChannel, {
    type: 'shareRooms',
    data: {
      rooms: store.get('rooms'),
    }
  });
}

const receiveRooms = ({rooms}) => {
  Object.keys(rooms).forEach(roomId => {
    store.updateOrInitializeRoom(roomId, rooms[roomId]);
  });
}