import Room from '@js/Room';
import Peer from '@js/Peer';

class Store {
  constructor() {
    this.peers = {};
    this.needRoomsInfo = true;
    this.rooms = {};
    this.currentUser = null;
  }

  set(key, val) {
    return this[key] = val;
  }

  get(key) {
    return this[key];
  }

  addPeer = (id, peerConnection) => {
    const peer = new Peer(id, peerConnection);
    this.peers[id] = peer;
    return peer;
  }
  
  getPeer = (id) => {
    return this.peers[id];
  }

  removePeer = (id) => {
    Object.values(this.rooms).forEach(room => room.memberships.removeMember(id));
    delete this.peers[id];
  }

  sendToPeer = (dataChannel, {type, data}) => {
    if (dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify({
        type,
        data: {
          ...data, 
          ...this.currentUser.getProfile(),
        }
      }));
    }
  }

  sendToPeers = ({type, data}) => {
    Object.values(this.peers).forEach(peer => {
      this.sendToPeer(peer.dataChannel, {type, data});
    });
  }

  getCurrentUser = () => {
    return this.currentUser;
  }

  getCurrentRoom = () => {
    return this.rooms[this.currentUser.state.currentRoomId];
  }

  getRoom = (roomId) => {
    return this.rooms[roomId];
  }

  updateOrInitializeRoom = (roomId, options = {roomId, name: roomId}) => {
    let room = this.rooms[roomId];
    if (room) {
      room.updateSelf(options);
    } else {
      const optionsClone = {...options};
      delete optionsClone['ephemeralHistory'];
      delete optionsClone['members'];
      room = new Room(optionsClone);
      this.rooms[roomId] = room;
      room.initialize();
    }
    return room;
  }

  isMe = (id) => {
    return id === this.currentUser.socketId;
  }
}

const store = new Store();

export default store;