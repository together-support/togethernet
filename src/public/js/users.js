import store from '../store/store.js';
import {renderPeer} from '../components/users.js';
import DOMPurify from 'dompurify';

export const setMyUserName = () => {
  const name = prompt("Please enter your name:");
  $("#_nameInput").text(DOMPurify(name));
};

export const updatePeerPosition = ({id, x, y}) => {
  $(`#peer-${id}`).finish().animate({
    left: x,
    top: y
  })
}

export const initPeer = (data) => {
  renderPeer(data).appendTo($('#ephemeralSpace'));
}

export const removePeer = (leavingUser) => {
  $(`#peer-${leavingUser}`).finish().animate({opacity: 0}, {
    complete: () => store.removePeer(leavingUser)
  });
}