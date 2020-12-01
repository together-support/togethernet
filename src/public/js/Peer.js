import store from '../store/index.js';

export default class Peer {
  constructor (socketId, peerConnection) {
    this.socketId = socketId;
    this.peerConnection = peerConnection;

    this.state = {
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
      ...this.state,
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
    const {name, left, top, avatar} = this.state;
    const displayName = name.slice(0, 2);
    const $avatar = $(`<div class="avatar" id="peer-${this.socketId}"><span>${displayName}<span></div>`);
    $avatar.css({
      left,
      top,
      backgroundColor: avatar,
    });

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
    const $makeFacilitatorContainer = $('<div class="longPressButton makeFacilitator" style="display:none"><div class="shortLine"/></div>');
    const $button = $('<button>Make Facilitator</button>');
    $button.on('mouseup', onTransferFacilitator);
    $button.appendTo($makeFacilitatorContainer);
    return $makeFacilitatorContainer;
  };

  initialize = (state) => {
    this.state = state;
  }

  updateState = (options) => {
    this.state = {
      ...this.state,
      ...options,
    }
    const {name, avatar} = this.state;
    this.getAvatarEl().finish().animate({backgroundColor: avatar}).find('span').text(String(name).slice(0, 2));
    this.getParticipantAvatarEl().finish().animate({backgroundColor: avatar});
  }

  updateDataChannel = (dataChannel) => {
    this.dataChannel = dataChannel;
  }

  updatePosition = ({left, top}) => {
    this.state = {...this.state, left, top}
    this.getAvatarEl().finish().animate({left, top});
  }

  initParticipantAvatar = () => {
    const $avatar = $(`<div class="participant" id="participant-${this.socketId}"></div>`);
    $avatar.css('background-color', this.state.avatar);
    return $avatar;
  }

  renderParticipantAvatar = () => {
    const $roomLink = store.getRoom(this.state.currentRoomId).$roomLink;
    this.getParticipantAvatarEl().appendTo($roomLink.find('.participantsContainer'));
  }

  render = () => {
    const room = store.getRoom(this.state.currentRoomId);
    const $avatar = this.getAvatarEl();

    if (room.hasFeature('facilitators') && room.hasFacilitator(store.getCurrentUser().socketId) && !room.hasFacilitator(this.socketId)) {
      this.makeFacilitatorButton(room.onTransferFacilitator).appendTo($avatar);
    }

    if (room.hasFacilitator(this.socketId)) {
      $avatar.addClass('facilitator')
    }

    $avatar.appendTo(room.$room);
  }
}