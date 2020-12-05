import pg from 'pg';
import range from 'lodash/range.js';

const {Pool} = pg;

class PGClient {
  constructor () {
    this.pool = new Pool({
      user: 'yaqing',
      host: 'localhost',
      database: 'togethernet',
      password: 'password',
      port: 5432,    
    });
  }

  write ({resource, values}) {
    const keys = Object.keys(values);
    const query = {
      text: `INSERT INTO ${resource}(${keys.join(',')}) VALUES(${range(1, keys.length + 1).map(i => `$${i}`)})`,
      values: Object.values(values),
    }

    this.pool.query(query, (error, _) => {
      if (error) {
        throw error;
      }
      console.log('message archived!');
    });
  }

  readAll (resource, callback) {
    this.pool.query(`SELECT * FROM ${resource}`, (error, results) => {
      callback(results.rows, error);
    });
  }
}

export default PGClient;