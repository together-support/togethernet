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
  } else if (data.type === 'requestEphemeralHistory') {
    sendEphemeralHistory(peerId);
  } else if (data.type === 'shareEphemeralHistory') {
    receiveEphemeralHistory(data.data);
  }
}

const renderIncomingEphemeralMessage = ({x, y, name, avatar, message, room}) => {
  textRecord({x, y, name, avatar, message, room}).appendTo($(`#${room}`));
  store.addEphemeralHistory({x, y, name, avatar, message, room});
}

const initPeer = (data) => {
  renderPeer(data).appendTo($(`#${data.room}`));
}

const updatePeerPosition = ({id, x, y}) => {
  $(`#peer-${id}`).finish().animate({left: x, top: y})
}

const updatePeerAvatar = ({id, avatar}) => {
  $(`#peer-${id}`).finish().animate({backgroundColor: avatar});
}

const removeEphemeralPeerMessage = ({messageId}) => {
  $(`.textRecord#${messageId}`).finish().animate({opacity: 0}, {
    complete: () => $(`textRecord#${messageId}`).remove()
  })
}

const sendEphemeralHistory = (peerId) => {
  const dataChannel = store.getPeer(peerId).dataChannel;
  store.sendToPeer(dataChannel, {
    type: 'shareEphemeralHistory',
    data: store.get('ephemeralHistory'),
  })
}

const receiveEphemeralHistory = (data) => {
  store.set('ephemeralHistory', {...store.get('ephemeralHistory'), ...data});
  store.set('needEphemeralHistory', false);
  const currentView = store.get('ephemeralHistory')[store.get('room')];
  Object.keys(currentView).forEach(messageRecordId => {
    renderIncomingEphemeralMessage({...currentView[messageRecordId], room: store.get('room')})
  })
}