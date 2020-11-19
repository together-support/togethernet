import {defaultRooms} from '../constants/index.js';
import Room from '../js/Room.js';

class Store {
  constructor() {
    this.avatar = '#000';
    this.socketId = '';
    this.currentRoomId = 'ephemeralSpace';

    this.peers = {};
    this.needRoomsInfo = true;

    this.rooms = {
      ...defaultRooms
    };

    this.topBoundary = 0;
    this.leftBoundary = 0;
    this.rightBoundary = 0;
    this.bottomBoundary = 0;

    this.avatarSize = 0;
  }

  set(key, val) {
    return this[key] = val;
  }

  get(key) {
    return this[key];
  }

  addPeer = (id, peer) => {
    this.peers[id] = peer
  }
  
  getPeer = (id) => {
    return this.peers[id];
  }

  setDataChannel = (id, channel) => {
    this.peers[id].dataChannel = channel;
  }

  removePeer = (id) => {
    delete this.peers[id];
  }

  sendToPeer = (dataChannel, {type, data}) => {
    if (dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify({
        type,
        data: {
          ...data, 
          ...this.getProfile(),
        }
      }));
    }
  }

  sendToPeers = ({type, data}) => {
    Object.values(this.peers).forEach(peer => {
      this.sendToPeer(peer.dataChannel, {type, data});
    });
  }
  
  getProfile = () => {
    return {
      socketId: this.socketId,
      name: $('#userName').text(),
      avatar: $('#userAvatar').val(),
      roomId: this.currentRoomId,
    }
  }

  getCurrentRoom = () => {
    return this.rooms[this.currentRoomId];
  }

  getRoom = (roomId) => {
    return this.rooms[roomId];
  }

  updateOrInitializeRoom = (roomId, options = {roomId, name: roomId}) => {
    let room = this.rooms[roomId];
    if (Boolean(room)) {
      room.updateSelf(options);
    } else {
      room = new Room(options)
      this.rooms[roomId] = room;
      room.initialize();
    }
    return room;
  }

  isMe = (id) => {
    return id === this.socketId;
  }
}

const store = new Store();

export default store;