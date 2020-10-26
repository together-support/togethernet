import store from '../store/store.js';

export const renderPeer = ({x, y, avatar}) => {
  const $peer = $(`<div class='square' id=${Object.keys(store.get('peers')).length - 1}></div>`);
  $peer.css({
    left: `${x}px`,
    top: `${y}px`,
    backgroundColor: avatar,
  });

  return $peer;
}