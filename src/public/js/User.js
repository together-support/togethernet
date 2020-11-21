import DOMPurify from 'dompurify';

import store from '../store/index.js';
import {makeDraggableUser} from './animatedAvatar.js';
import compact from 'lodash/compact';

export default class User {
  constructor (socketId) {
    this.socketId = socketId;

    this.state = {
      currentRoomId: 'ephemeralSpace',
    }

    this.$avatar = null;
  }

  initialize = async () => {
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

    await this.render();
    makeDraggableUser();
  }

  getProfile = () => {
    return {
      socketId: this.socketId,
      roomId: this.state.currentRoomId,
      name: $('#userName').text(),
      avatar: $('#userAvatar').val(),
    }
  }

  getRandomColor = () => {
    const randomColorString = Math.floor(Math.random() * 16777216).toString(16)
    return `#${randomColorString}${'0'.repeat(6 - randomColorString.length)}`.substring(0, 7);
  }

  getAdjacentMessages = () => {
    const {left, top} = $('#user').position();
    const avatarSize = $('#user').width();

    return compact([
      `${left}-${top + avatarSize}`,
      `${left}-${top - avatarSize}`,
      `${left - avatarSize}-${top}`,
      `${left + avatarSize}-${top}`,
    ]).map((position) => {
      return $(`#${this.state.currentRoomId}-${position}`)[0]
    });
  }
  
  setMyUserName = () => {
    const name = DOMPurify.sanitize(prompt("Please enter your name:"));
    if (Boolean(name)) {
      $("#userName").text(name);
    }
    store.sendToPeers({type: 'profileUpdated'});
  };

  isMe = (socketId) => {
    return this.socketId === socketId;
  }

  updateState = ({currentRoomId}) => {
    this.state = {...this.state, currentRoomId}
  }

  render = async () => {
    const $room = store.getRoom(this.state.currentRoomId).$room;
    this.$avatar.appendTo($room);
  }
}