import store from '../store/index.js';
import PeerConnection from './PeerConnection.js';
import {attachUIEvents} from './uiEvents.js';
import ArchivalSpace from './ArchivalSpace.js';

$(window).load(() => {
  const archivalSpace = new ArchivalSpace();
  archivalSpace.fetchArchivedMessages().then(() => {
    archivalSpace.render();
  });
  attachUIEvents();
  new PeerConnection().connect();
  window.debugStore = store;
});