class Store {
  constructor() {
    this.name = 'Anonymous'
    this.avatar = '#000';
    this.socketId = '';
    this.room = 'ephemeralSpace';

    this.peers = {};
    this.needEphemeralHistory = true;
    this.ephemeralHistory = {
      ephemeralSpace: {},
    };
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
    dataChannel.send(JSON.stringify({
      type,
      data: {
        ...data, 
        ...this.getProfile(),
      }
    }));
  }

  sendToPeers = ({type, data}) => {
    Object.values(this.peers).forEach(peer => {
      this.sendToPeer(peer.dataChannel, {type, data});
    });
  }

  addEphemeralHistory = (data) => {
    const {x, y, room} = data;
    const id = `${room}-${x}-${y}`;
    if (this.ephemeralHistory[room]) {
      this.ephemeralHistory[room][id] = {...data};
    } else {
      this.ephemeralHistory[room] = {[id]: {...data}};
    }
  }

  getProfile = () => {
    return {
      socketId: this.socketId,
      name: $('#_nameInput').text(),
      avatar: $('#userProfile').val(),
      room: this.room
    }
  }
}

const store = new Store();

export default store;