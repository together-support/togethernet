import { Pool } from 'pg';

class PGClient {
  constructor () {
    this.pool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DB,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT || 5432,
    });
  }

  write ({text, values}) {
    this.pool.query({text, values}, (err, res) => {
      console.log(err, res);
    });
  }

  read (text) {
    this.pool.query({text}, (err, response) => {
      console.log(err, response.rows);
      res.json(response.rows);
    });
  }
}

export default pgClient = new PGClient();