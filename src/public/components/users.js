import store from '../store/index.js';

export const peerAvatar = ({x, y, avatar, id}) => {
  const $peer = $(`<div class="avatar" id="peer-${id}"></div>`);
  $peer.css({
    left: x,
    top: y,
    backgroundColor: avatar,
  });

  return $peer;
}

export const userAvatar = () => {
  console.log(store.get('avatar'))
  const $user = $('<div id="user" class="avatar draggabble ui-widget-content"></div>');
  $user.css('background-color', store.get('avatar'));
  return $user;
}