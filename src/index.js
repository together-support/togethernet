import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import browserify from '../browserify.js'
import pick from 'lodash/pick.js';

import http from 'http';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';

import SignalingServer from './server/SignalingServer.js'
import archiver from './server/Archiver.js'

dotenv.config();
const app = express();
app.use(bodyParser.json());
const server = http.Server(app);

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
  const values = pick(req.body, ['name', 'message', 'roomId'])
  archiver.write({resource: 'message', values});
});

app.use(express.static(path.join(__dirname, '/public')));

app.get('/js/bundle.js',  browserify('src/public/js/index.js'))

const port = process.env.PORT || '3000';
server.listen(port, () => console.log(`server listening on ${port}`));

new SignalingServer(server).connect();