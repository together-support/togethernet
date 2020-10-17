import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import browserify from 'browserify-middleware';
import babelify from 'babelify';

import http from 'http';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';

import {connectSocket} from './server/connection.js'

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, '/public')));

app.get('/js/bundle.js', browserify([
  'debug', 'socket.io-client', 'simple-peer', 'p5', {
    'src/client/index.js': { run: true }
  }])
);

const port = process.env.PORT || '3000';
server.listen(port, () => console.log(`server listening on ${port}`));

connectSocket(server);