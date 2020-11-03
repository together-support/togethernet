import store from '../store/index.js';
import PeerConnection from './PeerConnection.js';
import {attachUIEvents} from './uiEvents.js'

$(window).load(() => {
  initAvatarColor();
  attachUIEvents();
  Object.values(store.get('rooms')).forEach(room => room.attachEvents());
  store.get('rooms')['ephemeralSpace'].goToRoom();
  new PeerConnection().connect();
});

const initAvatarColor = () => {
  const randomColor = Math.floor(Math.random() * 16777216).toString(16)
  const avatarColor = `#${randomColor}${'0'.repeat(6 - randomColor.length)}`.substring(0, 7);

  store.set('avatar', avatarColor);
  $('#userProfile').val(avatarColor);
}