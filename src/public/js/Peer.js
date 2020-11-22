export default class Peer {
  constructor (socketId, dataChannel) {
    this.socketId = socketId;
    this.dataChannel = dataChannel;

    this.currentRoomId = null;
    this.$avatar = null;
  }

  render () {
    const $room = store.getRoom(this.currentRoomId).$room;
    this.$avatar.appendTo($room);
  }
}