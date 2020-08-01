// server.js
// where your node app starts

// init project
let _ = require('lodash');
let http = require('http');
let browserify = require('browserify-middleware');
let debug = require('debug')('server');
const express = require("express");

//Express:is used to host files on the server
//You need a package.json to tie the dependencies to the server.js file
const app = express();
const bodyParser = require('body-parser');
let server = http.Server(app);
var io = require('socket.io')(server);

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
var DEFAULT_PEER_COUNT = 5;
app.use(express.static("public")); // use public folder as the location
app.use(bodyParser.json());
app.get('/js/bundle.js', browserify(['debug', 'lodash', 'socket.io-client', 'simple-peer', 'p5', { './client.js': { run: true } }]));
app.post('/archive', (req, res) => { //request, response // app.post activates when something is posted to /archive
    console.log(req.body);
    res.send('hello');
});
app.get('/archive', (req, res) => {
    res.send('got archive');
});

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