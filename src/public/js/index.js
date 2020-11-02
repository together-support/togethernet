import store from '../store/index.js'
import PeerConnection from './PeerConnection.js';
import Room from './Room.js';
import {attachUIEvents} from './uiEvents.js'

$(window).load(() => {
  attachUIEvents();
  Object.values(store.get('rooms')).forEach(roomConfig => {
    new Room(roomConfig).initialize();
  });
  new PeerConnection().connect();
});