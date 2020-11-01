class Store {
  constructor() {
    this.name = 'Anonymous'
    this.avatar = '#000';
    this.socketId = '';
    this.room = 'ephemeralSpace';

    this.peers = {};
    this.needEphemeralHistory = true;
    this.ephemeralHistory = {};
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

  increment = (attribute) => {
    if (!isNaN(this[attribute])) {
      this[attribute] += 1;
    }
  }

  sendToPeer = (dataChannel, {type, data}) => {
    dataChannel.send(JSON.stringify({
      type,
      data: {
        ...data, 
        socketId: this.socketId,
        name: $('#_nameInput').text(),
        avatar: $('#userProfile').val(),
        room: this.room
      }
    }));
  }

  sendToPeers = ({type, data}) => {
    Object.values(this.peers).forEach(peer => {
      this.sendToPeer(peer.dataChannel, {type, data});
    });
  }
}

const store = new Store();

export default store;