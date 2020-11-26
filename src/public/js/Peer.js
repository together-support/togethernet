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
    return $(`#peer-${this.socketId}`);
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
    const $roomLink = store.getRoom(this.currentRoomId).$roomLink;
    const $avatar = $(`<div class="participant" id="participant-${this.socketId}"></div>`);
    $avatar.css('background-color', this.avatar);
    $avatar.appendTo($roomLink.find('.participantsContainer'));
  }

  render = () => {
    const $room = store.getRoom(this.currentRoomId).$room;
    this.$avatar.appendTo($room);
  }
}