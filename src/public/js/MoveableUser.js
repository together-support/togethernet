import store from '../store/index.js';
import DOMPurify from 'dompurify';
import {sendPositionToPeers, showAdjacentMessages} from './positions.js';

export default class MoveableUser {
  initialize = () => {
    $('#_nameInput').on('click', this.setMyUserName);
    this.initializeAvatar();
    this.makeDraggable();
  };

  setMyUserName = () => {
    const name = prompt("Please enter your name:");
    if (Boolean(name)) {
      $("#_nameInput").text(DOMPurify.sanitize(name));
    }
  };

  initializeAvatar = () => {
    const $user = $('<div id="user" class="avatar draggabble ui-widget-content"></div>');
    const $userProfile = $('#userProfile');
    const randomColor = Math.floor(Math.random() * 16777216).toString(16)
    const avatarColor = `#${randomColor}${'0'.repeat(6 - randomColor.length)}`.substring(0, 7);

    store.set('avatar', avatarColor);
    $user.css('background-color', avatarColor);
    $userProfile.val(avatarColor);

    $userProfile.on('change', (e) => {
      e.preventDefault();
      $user.css('background-color', e.target.value);
      store.sendToPeers({
        type: 'changeAvatar'
      });
    });

    $user.appendTo($(`#${store.get('room')}`));
    store.set('avatarSize', $user.width());
  }

  makeDraggable = () => {
    $("#user").draggable({
      grid: [store.get('avatarSize'), store.get('avatarSize')],
      stop: this.onAnimationComplete,
    });
  }

  onAnimationComplete = () => {
    showAdjacentMessages();
    sendPositionToPeers();
  }
}