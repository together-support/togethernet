let _ = require('lodash');
let http = require('http');
let browserify = require('browserify-middleware');
let debug = require('debug')('server');
const express = require("express");
const { Pool, Client } = require('pg'); // https://node-postgres.com/features/connecting

const app = express();
const bodyParser = require('body-parser');
let server = http.Server(app);
var io = require('socket.io')(server);

var DEFAULT_PEER_COUNT = 5;
// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public")); // use public folder as the location
app.use(bodyParser.json());
app.get('/js/bundle.js', browserify(['debug', 'lodash', 'socket.io-client', 'simple-peer', 'p5', { './client.js': { run: true } }]));

// ARCHIVAL
// creating the connection
const pool = new Pool({ // the waiter 
    user: 'qgxlqacu',
    host: 'ruby.db.elephantsql.com',
    database: 'qgxlqacu',
    password: 'g7EaIPiTEsQ9br7Hwr6jeTh1eYOXOv9l',
    port: 5432, // default postgres port
});

app.post('/archive', (req, res) => { //request, response // app.post activates when something is posted to /archive

    const author = req.body.author;
    const outgoingPublicMsg = req.body.msg;

    console.log(author, outgoingPublicMsg);
    // res.send(`sent: ${outgoingPublicMsg}`);

    const outgoingQuery = {
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

// P2P
io.on('connection', function(socket) {
    debug('Connection with ID:', socket.id);
    console.log('Connected to node server');
    var peersToAdvertise = _.chain(io.sockets.connected)
        .values()
        .without(socket)
        .sampleSize(DEFAULT_PEER_COUNT)
        .value();
    debug('advertising peers', _.map(peersToAdvertise, 'id'));
    peersToAdvertise.forEach(function(socket2) {
        debug('Advertising peer %s to %s', socket.id, socket2.id);
        socket2.emit('peer', {
            peerId: socket.id,
            initiator: true
        });
        socket.emit('peer', {
            peerId: socket2.id,
            initiator: false
        });
    });

    socket.on('signal', function(data) {
        var socket2 = io.sockets.connected[data.peerId];
        if (!socket2) { return; }
        debug('Proxying signal from peer %s to %s', socket.id, socket2.id);

        socket2.emit('signal', {
            signal: data.signal,
            peerId: socket.id
        });
    });
});

server.listen(process.env.PORT || '3000');