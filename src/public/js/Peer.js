import store from '../store/index.js';

export default class Peer {
  constructor (socketId, peerConnection) {
    this.socketId = socketId;
    this.peerConnection = peerConnection;

    this.profile = {
      name: '',
      avatar: '',
      currentRoomId: '',
      left: 0,
      top: 0,
    }

    this.dataChannel = {};
  }

  getProfile = () => {
    return {
      name: this.name,
      avatar: this.avatar,
      socketId: this.socketId,
    }
  }

  getAvatarEl = () => {
    if ($(`#peer-${this.socketId}`).length === 1) {
      return $(`#peer-${this.socketId}`);
    } else {
      const {name, left, top, avatar, currentRoomId} = this.profile;
      const room = store.getRoom(currentRoomId);
      const displayName = name.slice(0, 2);
      const $peer = $(`<div class="avatar" id="peer-${this.socketId}"><span>${displayName}<span></div>`);
      $peer.css({
        left,
        top,
        backgroundColor: avatar,
      });

      if (room.hasFeature('facilitators') && room.hasFacilitator(store.getCurrentUser().socketId) && !room.hasFacilitator(this.socketId)) {
        this.makeFacilitatorButton(room.onTransferFacilitator).appendTo($peer);
      }
      $peer.on('mousedown', () => $peer.find('.makeFacilitator').show());
    
      return $peer;
    }
  }

  makeFacilitatorButton = (onTransferFacilitator) => {
    const $makeFacilitatorContainer = $('<div class="makeFacilitator" style="display:none"><div class="shortLine"/></div>');
    const $button = $('<button>Make Facilitator</button>');
    $button.on('mouseup', onTransferFacilitator);
    $button.appendTo($makeFacilitatorContainer);
    return $makeFacilitatorContainer;
  };

  initialize = (profile) => {
    this.profile = profile;
  }

  updateProfile = (options) => {
    this.profile = {
      ...this.profile,
      ...options,
    }
  }

  updateDataChannel = (dataChannel) => {
    this.dataChannel = dataChannel;
  }

  updatePosition = ({left, top}) => {
    this.profile = {...this.profile, left, top}
    this.getAvatarEl().finish().animate({left, top});
  }

  renderParticipantAvatar = () => {
    const {currentRoomId, avatar} = this.profile;
    const $roomLink = store.getRoom(currentRoomId).$roomLink;
    const $avatar = $(`#participant-${this.socketId}`).length ? $(`#participant-${this.socketId}`) : $(`<div class="participant" id="participant-${this.socketId}"></div>`);
    $avatar.css('background-color', avatar);
    $avatar.appendTo($roomLink.find('.participantsContainer'));
  }

  render = () => {
    const room = store.getRoom(this.currentRoomId);
    const $room = room.$room;
    this.getAvatarEl().appendTo($room);
  }
}