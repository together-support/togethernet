class Store {
  constructor() {
    this.name = 'Anonymous';
    this.stopSendMessage = false;
    this.selfX = 0;
    this.selfY = 0;
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