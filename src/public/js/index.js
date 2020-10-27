import PeerConnection from './PeerConnection.js';
import MoveableUser from './MoveableUser.js'
import {attachUIEvents} from './uiEvents.js'

$(window).load(() => {
  new MoveableUser().initialize();
  new PeerConnection().connect();
  attachUIEvents();
});