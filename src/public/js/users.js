import store from '../store/store.js';
import {changeName} from '../store/actions.js';
import {renderPeer} from '../components/users.js';

export const setMyUserName = () => {
  const name = prompt("Please enter your name:");
  changeName(name);
  const $nameInput = $("#_nameInput");
  $nameInput.text(store.get('name'));
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
  $(`#peer-${leavingUser}`).finish().animate({opacity: 0.1});
  store.removePeer(leavingUser)
}