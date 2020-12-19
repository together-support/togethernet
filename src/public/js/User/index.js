import DOMPurify from 'dompurify';

import store from '@js/store';
import {makeDraggableUser} from './animation';
import compact from 'lodash/compact';

export default class User {
  constructor (socketId) {
    this.socketId = socketId;

    this.state = {
      currentRoomId: 'ephemeralSpace',
    };
  }

  initialize = async () => {
    store.set('currentUser', this);
    $('#userAvatar').val(this.getRandomColor());

    $('#userAvatar').on('change', (e) => {
      const avatar = e.target.value;
      $('#user').css('background-color', avatar);
      $(`#participant-${store.getCurrentUser().socketId}`).css('background-color', avatar);
      store.sendToPeers({type: 'profileUpdated'});
    });

    $('#userName').text('Anonymous');
    $('#userName').on('click', this.setMyUserName);
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
    const initials = $('#userName').text().slice(0, 2);
    const $avatar = $(`<div id="user" class="avatar draggabble ui-widget-content"><span>${initials}<span></div>`);
    $avatar.css('background-color', $('#userAvatar').val());
    return $avatar;
  }

  getProfile = () => {
    return {
      socketId: this.socketId,
      roomId: this.state.currentRoomId,
      name: $('#userName').text(),
      avatar: $('#userAvatar').val(),
    };
  }

  getRandomColor = () => {
    const randomColorString = Math.floor(Math.random() * 16777216).toString(16);
    return `#${randomColorString}${'0'.repeat(6 - randomColorString.length)}`.substring(0, 7);
  }

  getAdjacentMessages = () => {
    const {left, top} = $('#user').position();
    const avatarSize = $('#user').outerWidth();

    return compact([
      `${left}-${top + avatarSize}`,
      `${left}-${top - avatarSize}`,
      `${left - avatarSize}-${top}`,
      `${left + avatarSize}-${top}`,
    ].map((position) => {
      return $(`#${this.state.currentRoomId}-${position}`)[0];
    }));
  }

  joinedRoom = (joinedRoomId) => {
    store.getRoom(joinedRoomId).goToRoom();
  }
  
  setMyUserName = () => {
    const name = DOMPurify.sanitize(prompt('Please enter your name:'));
    if (name) {
      $('#userName').text(name);
      $('#user').find('span').text(name.slice(0,2));
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
    $avatar.css('background-color', $('#userAvatar').val());
    $avatar.appendTo($roomLink.find('.participantsContainer'));
  }

  render = async () => {
    const room = store.getRoom(this.state.currentRoomId);
    const $avatar = this.$avatar();

    if (room.constructor.isEphemeral) {
      $avatar.toggleClass('facilitator', room.hasFacilitator(this.socketId));
    }

    makeDraggableUser();
    $avatar.appendTo(room.$room);
  }

  sendToServer = async (messageData) => {
    const {message, name, roomId, avatar, consentToArchiveRecords} = messageData;
    await fetch('/archive', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        author: name, 
        content: message,
        room_id: roomId,
        base_color: avatar,
        participant_names: Object.values(consentToArchiveRecords).map(r => r.name),
        secondary_colors: Object.values(consentToArchiveRecords).map(r => r.avatar),
        message_type: 'text_message'
      })
    })
      .then(response => response.text())
      .then(data => console.log(data));
  }
}