import PGClient from './PGClient.js'

class Archiver {
  constructor () {
    this.archivalClient = new PGClient();
  }

  write ({resource, values}) {
    return this.archivalClient.write({resource, values});
  }

  readAll (resource, callback) {
    return this.archivalClient.readAll(resource, callback);
  }
}

const archiver = new Archiver();

export default archiver;