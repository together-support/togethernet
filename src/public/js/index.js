import Peer from 'simple-peer';
import io from 'socket.io-client';
import update from 'lodash/update'

import publicConfig from './publicConfig.js'
import {attachSocketEvents} from './socketEvents.js';
import {loadHistory} from './history.js';

// let stopSendMsg = false;
// const record = "/record";

export const setup = () => {
  // const socket = io.connect();
  // attachSocketEvents(socket);

//   loadUserAvatar();
//   messageUI();
//   loadHistory();
//   sendPos();
}