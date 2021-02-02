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
      text: `INSERT INTO ${resource}(${keys.join(',')}) VALUES(${range(1, keys.length + 1).map(i => `$${i}`)}) RETURNING *`,
      values: Object.values(values),
    };

    this.pool.query(query, (error, result) => {
      callback(error, result);
    });
  }

  update ({resource, id, values, callback}) {
    const keys = Object.keys(values);
    const query = `UPDATE ${resource} SET ${keys.map(key => `${key} = '${values[key]}'`).join(', ')} WHERE id = ${id} RETURNING *`;
    
    this.pool.query(query, (error, result) => {
      callback(error, result);
    });
  }

  readAll (resource, callback) {
    this.pool.query(`SELECT * FROM ${resource}`, (error, results) => {
      callback(results.rows, error);
    });
  }

  delete ({resource, id, callback}) {
    this.pool.query(`DELETE FROM ${resource} WHERE id = ${id} RETURNING *`, (error, results) => {
      callback({result: results.rows[0], error});
    });
  }
}

export default PGClient;