export const peerAvatar = ({left, top, avatar, name, socketId}) => {
  const displayName = name.slice(0, 2);
  const $peer = $(`<div class="avatar" id="peer-${socketId}"><span>${displayName}<span></div>`);
  $peer.css({
    left,
    top,
    backgroundColor: avatar,
  });

  $peer.on('mousedown', () => $peer.find('.makeFacilitator').show());

  return $peer;
};

export const makeFacilitatorButton = (onTransferFacilitator) => {
  const $makeFacilitatorContainer = $('<div class="makeFacilitator" style="display:none"><div class="shortLine"/></div>');
  const $button = $('<button>Make Facilitator</button>');
  $button.on('mouseup', onTransferFacilitator);
  $button.appendTo($makeFacilitatorContainer);
  return $makeFacilitatorContainer;
};