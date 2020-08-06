let _ = require('lodash');
let http = require('http');
let browserify = require('browserify-middleware');
let debug = require('debug')('server');
const express = require("express");
const { Pool, Client } = require('pg'); // https://node-postgres.com/features/connecting
const { makeConnectionList } = require('./connection');

const app = express();
const bodyParser = require('body-parser');
let server = http.Server(app);
var io = require('socket.io')(server);
let port = process.env.PORT || '3000';
let numUsers = 0;

var DEFAULT_PEER_COUNT = 5;
// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public")); // use public folder as the location
app.use(bodyParser.json());
app.get('/js/bundle.js', browserify(['debug', 'lodash', 'socket.io-client', 'simple-peer', 'p5', { './client.js': { run: true } }]));

// ARCHIVAL - POSTGRES
// creating the connection
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
    // res.send(`sent: ${outgoingPublicMsg}`);
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

let peerArray = [];

// SOCKET COMMUNICATIONS
io.on('connection', function(socket1) {
    let addUser = false;
    debug('Connection with ID:', socket1.id);
    console.log('Connected to node server');
    var peersToAdvertise = _.chain(io.sockets.connected)
        .values()
        .without(socket1)
        .sampleSize(DEFAULT_PEER_COUNT)
        .value();
    debug('advertising peers', _.map(peersToAdvertise, 'id'));

    peerArray.push(socket1.id);

    // console.log(peerArray);

    let connectionList = makeConnectionList(peerArray);

    console.log(connectionList);

    console.log(peersToAdvertise, io.sockets.connected);

    peersToAdvertise.forEach(function(socket2) {
        for (let i = 0; i < connectionList.length; i++) {
            console.log('Advertising peer %s to %s', connectionList[i][0], connectionList[i][1]);

            socket2.emit('peer', {
                peerId: connectionList[i][0],
                initiator: true
            });
            socket1.emit('peer', {
                peerId: connectionList[i][1],
                initiator: false
            });
        }
        console.log("run");
    });


    // socket1.on('signal', function(data) {
    //     console.log(data.peerId, data.initiator);
    //     var socket2 = io.sockets.connected[data.peerId];
    //     if (!socket2) { return; }
    //     for (let i = 0; i < connectionList.length; i++) {
    //         console.log('Proxying signal from peer %s to %s', connectionList[i][0], connectionList[i][1]);
    //         socket2.emit('signal', {
    //             signal: data.signal,
    //             peerId: connectionList[i][0]
    //         });
    //         console.log(socket2.connected);
    //     }
    // });

    // broadcast public messages to everyone
    socket1.on('public message', function(data) {
        socket1.broadcast.emit('public message', {
            name: data.name,
            msg: data.outgoingMsg
        });
    });
});

server.listen(port);