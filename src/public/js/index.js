import {attachUIEvents} from './uiEvents.js'
import PeerConnection from './pureWebRTC.js';
import store from '../store/store.js';

$(window).load(() => {
  new PeerConnection().connect();
  // attachUIEvents();
}); 