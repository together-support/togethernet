import PeerConnection from './PeerConnection.js';
import AvatarAnimator from './animate.js'
import {attachUIEvents} from './uiEvents.js'
import {initAvatar} from './user.js'

$(window).load(() => {
  new PeerConnection().connect();
  new AvatarAnimator().attachAnimationEvents();
  attachUIEvents();
  initAvatar();
}); 