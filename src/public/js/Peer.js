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
      return this.initAvatar();
    }
  }

  initAvatar = () => {
    const {name, left, top, avatar, currentRoomId} = this.profile;
    const room = store.getRoom(currentRoomId);
    const displayName = name.slice(0, 2);
    const $avatar = $(`<div class="avatar" id="peer-${this.socketId}"><span>${displayName}<span></div>`);
    $avatar.css({
      left,
      top,
      backgroundColor: avatar,
    });

    if (room.hasFeature('facilitators') && room.hasFacilitator(store.getCurrentUser().socketId) && !room.hasFacilitator(this.socketId)) {
      this.makeFacilitatorButton(room.onTransferFacilitator).appendTo($avatar);
    }
    $avatar.on('mousedown', () => $avatar.find('.makeFacilitator').show());
  
    return $avatar;
  }

  getParticipantAvatarEl = () => {
    if ($(`#participant-${this.socketId}`).length === 1) {
      return $(`#participant-${this.socketId}`);
    } else {
      return this.initParticipantAvatar();
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
    const {name, avatar} = this.profile;
    this.getAvatarEl().finish().animate({backgroundColor: avatar}).find('span').text(String(name).slice(0, 2));
    this.getParticipantAvatarEl().finish().animate({backgroundColor: avatar});
  }

  updateDataChannel = (dataChannel) => {
    this.dataChannel = dataChannel;
  }

  updatePosition = ({left, top}) => {
    this.profile = {...this.profile, left, top}
    this.getAvatarEl().finish().animate({left, top});
  }

  initParticipantAvatar = () => {
    const $avatar = $(`<div class="participant" id="participant-${this.socketId}"></div>`);
    $avatar.css('background-color', this.profile.avatar);
    return $avatar;
  }

  renderParticipantAvatar = () => {
    const $roomLink = store.getRoom(this.profile.currentRoomId).$roomLink;
    this.getParticipantAvatarEl().appendTo($roomLink.find('.participantsContainer'));
  }

  render = () => {
    this.getAvatarEl().appendTo(store.getRoom(this.currentRoomId).$room);
  }
}