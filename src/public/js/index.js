import store from '../store/index.js';
import PeerConnection from './PeerConnection.js';
import {attachUIEvents} from './uiEvents.js';

$(window).load(() => {
  attachUIEvents();
  new PeerConnection().connect();

  window.debugStore = store;
});