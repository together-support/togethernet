import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import browserify from '../browserify.js'
import pick from 'lodash/pick.js';

import http from 'http';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';

import SignalingServer from './server/SignalingServer.js'
import Archiver from './server/Archiver.js'

dotenv.config();
const app = express();
app.use(bodyParser.json());
const server = http.Server(app);
const archiver = new Archiver();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.env.BASIC_AUTH_ENABLED) {
  app.use((req, res, next) => {      
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
  
    if (login === process.env.BASIC_AUTH_LOGIN && password === process.env.BASIC_AUTH_PASSWORD) {
      return next();
    }
  
    res.set('WWW-Authenticate', 'Basic realm="401"')
    res.status(401).send('Authentication required.')
  });
}

app.post('/archive', (req, res) => { 
  const values = pick(req.body, ['author', 'content', 'room_id', 'color', 'participants', 'secondary_colors']);
  archiver.write({resource: 'messages', values, callback: (error, result) => {
    if (error) {
      console.log(error);
    }
    signalingServer.alertArchivedMessage(result.rows[0]);
  }});
});

app.get('/archive', (_, response) => { 
  archiver.readAll('messages', (messages, error) => {
    if (error) {
      console.log(error)
    }
    response.status(200).json(messages);
  });
});

app.use(express.static(path.join(__dirname, '/public')));

app.get('/js/bundle.js',  browserify('src/public/js/index.js'))

const port = process.env.PORT || '3000';
server.listen(port, () => console.log(`server listening on ${port}`));

const signalingServer = new SignalingServer(server)
signalingServer.connect();