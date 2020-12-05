import store from '../store/index.js';
import PeerConnection from './PeerConnection.js';
import {attachUIEvents} from './uiEvents.js';
import archivalSpace from './archivalSpace.js';

$(window).load(() => {
  archivalSpace.fetchArchivedMessages().then(() => {
    archivalSpace.render();
  });
  attachUIEvents();
  new PeerConnection().connect();
  window.debugStore = store;
});