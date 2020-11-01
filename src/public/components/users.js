export const renderPeer = ({x, y, avatar, id}) => {
  const $peer = $(`<div class="avatar" id="peer-${id}"></div>`);
  $peer.css({
    left: x,
    top: y,
    backgroundColor: avatar,
  });

  return $peer;
}