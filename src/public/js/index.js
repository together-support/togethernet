import {attachUIEvents} from './uiEvents.js'
import PeerConnection from './pureWebRTC.js';

$(window).load(() => {
  attachUIEvents();
  new PeerConnection().connect();
}); 