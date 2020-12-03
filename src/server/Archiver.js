import PGClient from './PGClient.js'

class Archiver {
  constructor () {
    this.archivalClient = new PGClient();
  }

  write ({resource, values}) {
    this.archivalClient.write({resource, values});
  }

  read (resource, id) {
    this.archivalClient.read({resource, id});
  }
}

const archiver = new Archiver();

export default archiver;