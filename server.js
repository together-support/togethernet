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

app.get('/sockets', (req, res)=>{
  // returns list of current socket ids
  console.log(io.sockets.connected);
  return res.json(Object.keys(io.sockets.connected));
})

// SOCKET COMMUNICATIONS
/*
 * imagine we have two users, A and B
 * A connects to the server, which triggers a 'connection' event and registers A with socket.io
 * B connects to the server, which triggers a 'connection' event and registers B with socket.io
 * when B connects, it sees that A is also connected.
 * B sends a peer event to A
 * B sends a signal to A
 * A sends a signal to B
 * A and B are now connected
 * p2p means they don't actually rely on the ws implementation here except for handshake
 *
 *  when C connects, C signals to A and B
 *  right now C signals to A and B again instead of A and B responding to C
 */

io.on('connection', function(socket) {
  console.log("============================connection=====================")
  console.log(socket.id, 'has connected');
  let existingSockets = Object.values(io.sockets.connected).filter(item=>item.id !== socket.id);
  console.log('existingSockets is', existingSockets.map(socket=>socket.id))
  console.log('and should not include', socket.id)
  //connect to existing peers
  existingSockets.forEach(targetSocket =>{
    console.log(`peer event to ${socket.id} (initiator) and ${targetSocket.id} (receiver)`);
    socket.emit('peer', {peerId: targetSocket.id, initiator: true});
    targetSocket.emit('peer', {peerId: socket.id, initiator: false});
  })

    socket.on('signal', function(data) {
      console.log("============================signal=====================")
      //updates existing socket list
      existingSockets = Object.values(io.sockets.connected).filter(item=>item.id !== socket.id);
      console.log('existingSockets is', existingSockets.map(socket=>socket.id))
      console.log('and should not include', socket.id)

      //fix later! should only send to one client at a time instead of all
      //where did it come from
      //where is it going?
      //io.sockets.connected[data.peerId]
      console.log('is data.peerId in io.sockets.connected?', data.peerId)
      console.log(Object.keys(io.sockets.connected))
      io.sockets.connected[data.peerId].emit(
        'signal', {
          signal: data.signal,
          peerId: socket.id
      })
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
    // i don't think this currently does anything
    socket.on('public message', function(data) {
      console.log('emitting public message to', data.name);
        socket.broadcast.emit('public message', {
            name: data.name,
            msg: data.outgoingMsg
        });
    });
});

server.listen(port);
