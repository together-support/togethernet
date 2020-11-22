import store from '../store/index.js';

export const peerAvatar = ({left, top, avatar, socketId}) => {
  const $peer = $(`<div class="avatar" id="peer-${socketId}"></div>`);
  $peer.css({
    left,
    top,
    backgroundColor: avatar,
  });

  $peer.on('mousedown', () => $peer.find('.makeFacilitator').show());

  return $peer;
}

export const participantAvatar = ({avatar, socketId}) => {
  const $avatar = $(`<div class="participant" id="participant-${socketId}"></div>`);
  $avatar.css('background-color', avatar);
  return $avatar;
}

export const makeFacilitatorButton = (onTransferFacilitator) => {
  const $makeFacilitatorContainer = $('<div class="makeFacilitator" style="display:none"><div class="shortLine"/></div>');
  const $button = $('<button>Make Facilitator</button>');
  $button.on('mouseup', onTransferFacilitator);
  $button.appendTo($makeFacilitatorContainer);
  return $makeFacilitatorContainer;
}