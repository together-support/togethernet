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
  }
}

export const renderIncomingEphemeralMessage = ({x, y, name, avatar, message}) => {
  store.increment('messageIndex');
  store.addActivePositions({x, y});
  textRecord({x, y, name, avatar, message}).appendTo($('#ephemeralSpace'));
}

export const initPeer = (data) => {
  renderPeer(data).appendTo($('#ephemeralSpace'));
}

export const updatePeerPosition = ({id, x, y}) => {
  $(`#peer-${id}`).finish().animate({
    left: x,
    top: y
  })
}

export const updatePeerAvatar = ({id, avatar}) => {
  $(`#peer-${id}`).finish().animate({
    backgroundColor: avatar
  });
}