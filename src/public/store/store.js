class Store {
  constructor() {
    this.name = 'Anonymous'
    this.avatar = '#000';
    this.stopSendMessage = false;
    this.position = {
      x: 0,
      y: 0,
    }
    this.selfX = 0;
    this.selfY = 0;
    this.room = 'ephemeral';
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