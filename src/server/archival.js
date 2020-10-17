import { Pool, Client } from 'pg';

// ARCHIVAL - POSTGRES
// creating the connection
// https://node-postgres.com/features/connecting

const pool = new Pool({ // the waiter 
    user: 'qgxlqacu',
    host: 'ruby.db.elephantsql.com',
    database: 'qgxlqacu',
    password: 'g7EaIPiTEsQ9br7Hwr6jeTh1eYOXOv9l',
    port: 5432, // default postgres port
});

app.post('/archive', (req, res) => { //request, response // app.post activates when something is posted to /archive
    const author = req.body.name;
    const outgoingPublicMsg = req.body.msg;
    console.log(author, outgoingPublicMsg);
    let outgoingQuery = {
        text: "INSERT INTO archive(author, msg) VALUES($1,$2)",
        values: [author, outgoingPublicMsg]
    }
    pool.query(outgoingQuery, (err, res) => {
        console.log(err, res);
    });
});

app.get('/archive', (req, res) => {
    res.send('got archive');
});

app.get('/record', (req, res) => {
    let data;
    let incomingQuery = {
        text: "SELECT time, author, msg FROM archive"
    }
    pool.query(incomingQuery, (err, response) => {
        console.log(err, response.rows);
        res.json(response.rows);
    });
});
