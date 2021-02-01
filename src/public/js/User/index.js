import DOMPurify from 'dompurify';

import store from '@js/store';
import compact from 'lodash/compact';

export default class User {
  constructor (socketId) {
    this.socketId = socketId;

    this.state = {
      currentRoomId: 'sitting-at-the-park',
    };
  }

  initialize = async () => {
    store.set('currentUser', this);
    $('#changeUserAvatar').val(this.getRandomColor());

    $('#changeUserAvatar').on('change', (e) => {
      const avatar = e.target.value;
      $('#user .avatar').css('background-color', avatar);
      $(`#participant-${store.getCurrentUser().socketId}`).css('background-color', avatar);
      store.sendToPeers({type: 'profileUpdated'});
    });

    $('#changeUserName span').text('Anonymous');
    $('#changeUserName').on('click', this.setMyUserName);
    await this.render();
  }

  $avatar = () => {
    if ($('#user').length === 1) {
      return $('#user');
    } else {
      return this.initAvatar();
    }
  }

  initAvatar = () => {
    const $user = $('<div id="user"></div>');
    const $shadow = $('<div class="shadow"></div>');

    const initials = $('#changeUserName span').text().slice(0, 2);
    const $avatar = $(`<div class="avatar draggabble ui-widget-content"><span>${initials}<span></div>`);
    $avatar.css('background-color', $('#changeUserAvatar').val());

    $avatar.appendTo($user);
    $shadow.appendTo($user);

    return $user;
  }

  getProfile = () => {
    return {
      socketId: this.socketId,
      roomId: this.state.currentRoomId,
      name: $('#changeUserName').text(),
      avatar: $('#changeUserAvatar').val(),
    };
  }

  getRandomColor = () => {
    const randomColorString = Math.floor(Math.random() * 16777216).toString(16);
    return `#${randomColorString}${'0'.repeat(6 - randomColorString.length)}`.substring(0, 7);
  }

  getAdjacentMessages = () => {
    const gridColumnStart = parseInt($('#user .shadow').css('grid-column-start'));
    const gridRowStart = parseInt($('#user .shadow').css('grid-row-start'));

    return compact([
      `${gridColumnStart}-${gridRowStart + 1}`,
      `${gridColumnStart}-${gridRowStart - 1}`,
      `${gridColumnStart - 1}-${gridRowStart}`,
      `${gridColumnStart + 1}-${gridRowStart}`,
    ].map((position) => {
      return $(`#${this.state.currentRoomId}-${position}`)[0];
    }));
  }

  joinedRoom = (joinedRoomId) => {
    store.getRoom(joinedRoomId).goToRoom();
  }
  
  setMyUserName = () => {
    const name = DOMPurify.sanitize(prompt('Please enter your name (max 25 characters):'));
    if (name) {
      $('#changeUserName span').text(name.substr(0, 25));
      $('#changeUserName').fitText((name.length > 19 ? 2 : 1), {minFontSize: '12px', maxFontSize: '16px'});
      $('#user').find('span').text(name.substr(0,2));
    }
    store.sendToPeers({type: 'profileUpdated'});
  };

  isMe = (socketId) => {
    return this.socketId === socketId;
  }

  updateState = ({currentRoomId}) => {
    this.state = {...this.state, currentRoomId};
  }

  renderParticipantAvatar = () => {
    const $roomLink = store.getRoom(this.state.currentRoomId).$roomLink;
    const $avatar = $(`#participant-${this.socketId}`).length ? $(`#participant-${this.socketId}`) : $(`<div class="participant" id="participant-${this.socketId}"></div>`);
    $avatar.css('background-color', $('#changeUserAvatar').val());
    $avatar.appendTo($roomLink.find('.participantsContainer'));
  }

  render = async () => {
    const room = store.getRoom(this.state.currentRoomId);
    const $avatar = this.$avatar();

    if (room.constructor.isEphemeral) {
      $avatar.toggleClass('facilitator', room.hasFacilitator(this.socketId));
    }
    $avatar.appendTo(room.$room);
  }
}