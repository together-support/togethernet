import PGClient from './PGClient.js';

class Archiver {
  constructor () {
    this.archivalClient = new PGClient();
  }

  write ({resource, values, callback}) {
    return this.archivalClient.write({resource, values, callback});
  }

  update ({resource, id, values, callback}) {
    return this.archivalClient.update({resource, id, values, callback});
  }

  readAll (resource, callback) {
    return this.archivalClient.readAll(resource, callback);
  }

  delete ({resource, id, callback}) {
    return this.archivalClient.delete({resource, id, callback});
  }
}

export default Archiver;