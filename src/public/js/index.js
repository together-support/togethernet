import PeerConnection from './PeerConnection.js';
import {attachUIEvents, setUpDefaultRooms} from './uiEvents.js'

$(window).load(() => {
  attachUIEvents();
  setUpDefaultRooms();
  new PeerConnection().connect();
});