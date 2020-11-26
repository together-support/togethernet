import store from '../store/index.js';

export default class Peer {
  constructor (socketId, peerConnection) {
    this.socketId = socketId;
    this.peerConnection = peerConnection;

    this.name = '';
    this.avatar = '';
    this.currentRoomId = '';
    this.dataChannel = {};

    this.$avatar = null;
  }

  getProfile = () => {
    return {
      name: this.name,
      avatar: this.avatar,
      socketId: this.socketId,
    }
  }

  initialize = () => {

  }

  render = () => {
    const $room = store.getRoom(this.currentRoomId).$room;
    this.$avatar.appendTo($room);
  }
}