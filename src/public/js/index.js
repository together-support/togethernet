import {attachUIEvents} from './uiEvents.js'
import PeerConnection from './PeerConnection.js';

$(window).load(async () => {
  new PeerConnection().connect()
  attachUIEvents();
}); 