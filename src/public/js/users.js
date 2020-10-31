import store from '../store/store.js';
import {renderPeer} from '../components/users.js';

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

export const initPeer = (data) => {
  renderPeer(data).appendTo($('#ephemeralSpace'));
}

export const removePeer = (leavingUser) => {
  $(`#peer-${leavingUser}`).finish().animate({opacity: 0}, {
    complete: () => store.removePeer(leavingUser)
  });
}