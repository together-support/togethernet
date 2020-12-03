import pg from 'pg';
import range from 'lodash/range.js';

const {Client} = pg;

class PGClient {
  constructor () {
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    this.client.connect();
  }

  write ({resource, values}) {
    const keys = Object.keys(values);
    const query = {
      text: `INSERT INTO ${resource}(${keys.join(',')}) VALUES(${range(1, keys.length).map(i => `$${i}`)})`,
      values: Object.values(values),
    }
    
    console.log(query)
  }

  read (resource, id) {
    if (Boolean(id)) {

    } else {
      this.client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
          console.log(JSON.stringify(row));
        }
        client.end();
      });
    }
  }
}

export default PGClient;