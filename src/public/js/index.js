import {attachUIEvents} from './uiEvents.js'
import PeerConnection from './PeerConnection.js';
import store from '../store/store.js';

$(window).load(async () => {
  new PeerConnection().connect()
  // attachUIEvents();
}); 