class Store {
  constructor() {
    this.name = 'Anonymous'
    this.avatar = '#000';
    this.socketId = '';
    this.allowSendMessage = true;
    this.room = 'ephemeral';

    this.messageIndex = 0;
    this.systemMessageIndex = 0;

    this.activePositions = {};
    this.myActivePositions = {};

    this.peers = {};
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

  addMyActivePositions = () => {
    const position = $('#user').position();
    if (Boolean(this.myActivePositions)[position.left]) {
      this.myActivePositions[position.left][position.top] = true
    } else {
      this.myActivePositions[position.left] = {[position.left]: true};
    }

    this.addActivePositions({x: position.left, y: position.top});
  }
  
  addActivePositions = ({x, y}) => {
    if (Boolean(this.activePositions)[x]) {
      this.activePositions[x][y] = true
    } else {
      this.activePositions[x] = {[y]: true};
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