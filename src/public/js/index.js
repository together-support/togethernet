import Peer from 'simple-peer';
import io from 'socket.io-client';
import update from 'lodash/update'

import publicConfig from './publicConfig.js'
import {attachSocketEvents} from './socketEvents.js';
import {loadHistory} from './history.js';
import {attachUIEvents} from './uiEvents.js'

// let stopSendMsg = false;
// const record = "/record";

$(window).load(() => {
  // loadSocketConnections();
  // loadUserProfile();
  // const socket = io.connect();
  // attachSocketEvents(socket);
  //   loadUserAvatar();
  //   loadHistory();
  //   sendPos();

  attachUIEvents();
  // attachSocketEvents();
});