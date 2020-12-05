import pg from 'pg';
import range from 'lodash/range.js';

const {Pool} = pg;

class PGClient {
  constructor () {
    this.pool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DB,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT,    
    });
  }

  write ({resource, values, callback}) {
    const keys = Object.keys(values);
    const query = {
      text: `INSERT INTO ${resource}(${keys.join(',')}) VALUES(${range(1, keys.length + 1).map(i => `$${i}`)})`,
      values: Object.values(values),
    }

    this.pool.query(query, (error, _) => {
      callback(error);
    });
  }

  readAll (resource, callback) {
    this.pool.query(`SELECT * FROM ${resource}`, (error, results) => {
      callback(results.rows, error);
    });
  }
}

export default PGClient;