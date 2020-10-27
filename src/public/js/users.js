import store from '../store/store.js';
import {changeName} from '../store/actions.js';
import {renderPeer} from '../components/users.js';

export const setMyUserName = () => {
  const name = prompt("Please enter your name:");
  changeName(name);
  const $nameInput = $("#_nameInput");
  $nameInput.text(store.get('name'));
};

export const initMyAvatar = () => {
  const $user = $('#user');
  const $userProfile = $('#userProfile');
  const avatarColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  store.set('avatar', avatarColor);
  $user.css('background-color', avatarColor);
  $userProfile.val(avatarColor);

  $userProfile.on('change', (e) => {
    e.preventDefault();
    $user.css('background-color', e.target.value);
  });
}

export const updatePeerPosition = ({id, x, y}) => {
  $(`#peer-${id}`).css({
    left: x,
    top: y
  })
}

export const initPeer = (data) => {
  renderPeer(data).appendTo($('#ephemeralSpace'));
}

export const removePeer = (leavingUser) => {
  $(`#peer-${leavingUser}`).remove();
  store.removePeer(leavingUser)
}