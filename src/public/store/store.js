class Store {
  constructor() {
    this.name = 'Anonymous'
    this.avatar = '#000';
    this.socketId = '';
    this.allowSendMessage = true;
    this.position = {};
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
}

const store = new Store();

export default store;