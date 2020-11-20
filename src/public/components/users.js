import store from '../store/index.js';

export const peerAvatar = ({x, y, avatar, socketId}) => {
  const $peer = $(`<div class="avatar" id="peer-${socketId}"></div>`);
  $peer.css({
    left: x,
    top: y,
    backgroundColor: avatar,
  });

  return $peer;
}

export const userAvatar = () => {
  const $user = $('<div id="user" class="avatar draggabble ui-widget-content"></div>');
  $user.css('background-color', store.get('avatar'));
  return $user;
}

export const participantAvatar = ({avatar, socketId}) => {
  const $avatar = $(`<div class="participant" id="participant-${socketId}"></div>`);
  $avatar.css('background-color', avatar);
  return $avatar;
}