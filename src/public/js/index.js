import store from '../store/index.js';
import PeerConnection from './PeerConnection.js';
import {attachUIEvents} from './uiEvents.js'

$(window).load(() => {
  initUserProfile();
  attachUIEvents();
  new PeerConnection().connect();
});

const initUserProfile = () => {
  const avatar = getRandomColor();
  store.set('avatar', avatar);
  $('#userAvatar').val(avatar);
  
  const name = 'Anonymous';
  store.set('name', name);
  $('#userName').text(name);

  window.debugStore = store
}

const getRandomColor = () => {
  const randomColorString = Math.floor(Math.random() * 16777216).toString(16)
  return `#${randomColorString}${'0'.repeat(6 - randomColorString.length)}`.substring(0, 7);
}