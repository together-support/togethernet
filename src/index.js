import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import browserify from '../browserify.js'

import http from 'http';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';

import SocketConnection from './server/connection.js'

dotenv.config();
const app = express();
app.use(bodyParser.json());
const server = http.Server(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, '/public')));

app.get('/js/bundle.js',  browserify('src/public/js/index.js'))

const port = process.env.PORT || '3000';
server.listen(port, () => console.log(`server listening on ${port}`));

new SocketConnection(server).connect();