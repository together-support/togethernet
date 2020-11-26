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
      const {name, left, top, avatar} = this.profile;
      const displayName = name.slice(0, 2);
      const $peer = $(`<div class="avatar" id="peer-${this.socketId}"><span>${displayName}<span></div>`);
      $peer.css({
        left,
        top,
        backgroundColor: avatar,
      });
    
      $peer.on('mousedown', () => $peer.find('.makeFacilitator').show());
    
      return $peer;
    }
  }

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
    const $avatar = this.getAvatarEl();

    if (room.hasFeature('facilitators') && room.hasFacilitator(store.getCurrentUser().socketId) && !room.hasFacilitator(this.socketId)) {
      makeFacilitatorButton(room.onTransferFacilitator).appendTo($avatar);
    }
    $avatar.appendTo($room);
  }
}