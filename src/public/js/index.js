import PeerConnection from './PeerConnection.js';
import {attachUIEvents} from './uiEvents.js'
import {displayAvatar, initAvatar} from './user.js'

$(window).load(async () => {
  new PeerConnection().connect()
  attachUIEvents();
  initAvatar();
}); 