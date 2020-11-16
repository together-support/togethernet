import store from '../store/index.js';
import PeerConnection from './PeerConnection.js';
import {attachUIEvents} from './uiEvents.js'

$(window).load(() => {
  initUserProfile();
  attachUIEvents();
  Object.values(store.get('rooms')).forEach(room => room.attachEvents());
  store.getCurrentRoom().goToRoom();
  new PeerConnection().connect();
});

const initUserProfile = () => {
  const avatar = localStorage.getItem('tnAvatar') || getRandomColor();
  const name = localStorage.getItem('tnName') || 'Anonymous';

  localStorage.setItem('tnAvatar', avatar);
  localStorage.setItem('tnName', name);

  store.set('avatar', avatar);
  store.set('name', name);
  $('#userAvatar').val(avatar);
  $('#userName').text(name);
}

const getRandomColor = () => {
  const randomColorString = Math.floor(Math.random() * 16777216).toString(16)
  return `#${randomColorString}${'0'.repeat(6 - randomColorString.length)}`.substring(0, 7);
}