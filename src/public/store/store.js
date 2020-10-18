class Store {
  constructor() {
    this.name = 'Anonymous';
    this.stopSendMessage = false;
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