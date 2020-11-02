import PeerConnection from './PeerConnection.js';
import MoveableUser from './MoveableUser.js';
import Room from './Room.js';
import store from '../store/index.js'
import {attachUIEvents} from './uiEvents.js'

$(window).load(() => {
  attachUIEvents();
  
  Object.values(store.get('rooms')).forEach(roomConfig => {
    new Room(roomConfig).initialize();
  });

  new MoveableUser().initialize();
  new PeerConnection().connect();
});