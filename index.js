import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import browserify from 'browserify-middleware';
import babelify from 'babelify';

import {onConnection} from './src/server/connection.js'

browserify.settings({
  transform: [babelify.configure({
    extensions: ['.js'],
    presets: ["@babel/preset-env", "@babel/preset-react"]
  })]
});

dotenv.config();
const app = express();
app.use(bodyParser.json());
const server = http.Server(app);

app.use(express.static("src/views"));

const port = process.env.PORT || '3000';
server.listen(port, () => console.log(`server listening on ${port}`));

app.get('/js/bundle.js', browserify([
  'debug', 'socket.io-client', 'simple-peer', 'p5', {
    'src/client/index.js': { run: true }
  }])
);

onConnection(server);