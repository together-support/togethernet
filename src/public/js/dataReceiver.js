import {textRecord} from '../components/message.js';
import {renderPeer} from '../components/users.js';
import store from '../store/store.js'

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
  }
}

export const renderIncomingEphemeralMessage = ({x, y, name, avatar, message, room}) => {
  store.increment('messageIndex');
  textRecord({x, y, name, avatar, message, room}).appendTo($(`#${room}`));
}

export const initPeer = (data) => {
  renderPeer(data).appendTo($(`#${data.room}`));
}

export const updatePeerPosition = ({id, x, y}) => {
  $(`#peer-${id}`).finish().animate({left: x, top: y})
}

export const updatePeerAvatar = ({id, avatar}) => {
  $(`#peer-${id}`).finish().animate({backgroundColor: avatar});
}

export const removeEphemeralPeerMessage = ({messageId}) => {
  $(`.textRecord#${messageId}`).finish().animate({opacity: 0}, {
    complete: () => $(`textRecord#${messageId}`).remove()
  })
}