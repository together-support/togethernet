import PeerConnection from './PeerConnection.js';
import AvatarAnimator from './animate.js'
import {attachUIEvents} from './uiEvents.js'
import {initMyAvatar} from './users.js'

$(window).load(() => {
  initMyAvatar();
  new PeerConnection().connect();
  new AvatarAnimator().attachAnimationEvents();
  attachUIEvents();
});