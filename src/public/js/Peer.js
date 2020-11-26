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
      y: 0,
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

  updatePeerProfile = (options) => {
    this.profile = {
      ...this.profile,
      ...options,
    }
  }

  updateDataChannel = (dataChannel) => {
    this.dataChannel = dataChannel;
  }

  render = () => {
    const $room = store.getRoom(this.currentRoomId).$room;
    this.$avatar.appendTo($room);
  }
}