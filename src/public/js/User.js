import DOMPurify from 'dompurify';

import store from '../store/index.js';
import {makeDraggableUser} from './animatedAvatar.js';

export default class User {
  constructor (socketId) {
    this.socketId = socketId;
    this.$avatar = null;
  }

  initialize = () => {
    store.set('currentUser', this);

    $('#userAvatar').val(this.getRandomColor());
    $('#userName').text('Anonymous');

    $('#userName').on('click', this.setMyUserName);

    $('#userAvatar').on('change', (e) => {
      const avatar = e.target.value
      $('#user').css('background-color', avatar);
      store.sendToPeers({type: 'profileUpdated'});
    });

    const $avatar = $('<div id="user" class="avatar draggabble ui-widget-content"></div>');
    $avatar.css('background-color', $('#userAvatar').val());
    this.$avatar = $avatar;

    this.renderInRoom(store.currentRoomId);
    makeDraggableUser();
  }

  getProfile = () => {
    return {
      socketId: this.socketId,
      name: $('#userName').text(),
      avatar: $('#userAvatar').val(),
    }
  }

  getRandomColor = () => {
    const randomColorString = Math.floor(Math.random() * 16777216).toString(16)
    return `#${randomColorString}${'0'.repeat(6 - randomColorString.length)}`.substring(0, 7);
  }

  adjacentPositions = () => {
    
  }
  
  setMyUserName = () => {
    const name = DOMPurify.sanitize(prompt("Please enter your name:"));
    if (Boolean(name)) {
      $("#userName").text(name);
    }
    store.sendToPeers({type: 'profileUpdated'});
  };

  renderInRoom (roomId) {
    const $room = store.getRoom(roomId).$room;
    this.$avatar.appendTo($room);
  }
}