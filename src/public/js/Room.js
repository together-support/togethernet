import store from '../store/index.js';
import throttle from 'lodash/throttle';
import {userAvatar} from '../components/users.js';

export default class Room {
  constructor(options) {
    this.mode = options.mode;
    this.ephemeral = options.ephemeral;
    this.name = options.name;
    this.roomId = options.roomId;
    this.$roomEl = null;
    this.isCurrentRoom = store.get('room') === this.roomId;
  }

  initialize = () => {
    this.initializeMenuButton();
    this.initializeSpace();
    if (this.ephemeral) { this.attachKeyboardEvents(); }

    this.$roomEl.on('showRoom', this.showRoom);
    this.$roomEl.on('hideRoom', this.hideRoom);
  }

  initializeMenuButton = () => {
    const $roomLink = $('<button type="button" class="tab icon"></button>')
    const $roomTitle = $('<p></p>');
    $roomTitle.text(this.name);
    $roomTitle.appendTo($roomLink);
    $roomLink.on('click', () => {
      $('.chat').each((_, el) => {
        $(el).hide();
      })
      $(`#${this.roomId}`).trigger('showRoom');
    })
    $roomLink.insertBefore($('#addRoom'));
  }

  initializeSpace = () => {
    const $room = $(`<div class="chat" id="${this.roomId}" tabindex="0"></div>`);
    this.ephemeral ? $room.addClass('squaresView') : $room.addClass('listView');
    if (!this.isCurrentRoom) { $room.addClass('hidden') };
    $room.appendTo('#rooms');
    this.$roomEl = $room;

    this.renderUserAvatar();
    this.changeBoundary();
  }

  renderUserAvatar = () => {
    userAvatar().appendTo($(`#${store.get('room')}`));
    this.draggableUser();
    store.set('avatarSize', $("#user").width());
  }

  attachKeyboardEvents = () => {
    const animationEvents = {
      'ArrowUp': this.moveUp,
      'ArrowLeft': this.moveLeft,
      'ArrowRight': this.moveRight,
      'ArrowDown': this.moveDown
    }

    this.$roomEl.on('keydown', (event) => {
      event.preventDefault();
      if(['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
        animationEvents[event.key]();
      }
    });
  };

  moveUp = () => {
    const newY = $('#user').position().top - store.get('avatarSize');
    if (newY >= store.get('topBoundary')) {
      $("#user").finish().animate({top: `-=${store.get('avatarSize')}`}, {complete: this.onAnimationComplete});
    }
  }

  moveDown = () => {
    const newY = $('#user').position().top + store.get('avatarSize');
    if (newY + store.get('avatarSize') <= store.get('bottomBoundary')) {
      $("#user").finish().animate({top: `+=${store.get('avatarSize')}`}, {complete: this.onAnimationComplete});
    }
  }

  moveLeft = () => {
    const newX = $('#user').position().left - store.get('avatarSize');
    if (newX >= store.get('leftBoundary')) {
      $("#user").finish().animate({left: `-=${store.get('avatarSize')}`}, {complete: this.onAnimationComplete});
    }
  }

  moveRight = () => {
    const newX = $('#user').position().left + store.get('avatarSize');
    if (newX + store.get('avatarSize') <= store.get('rightBoundary')) {
      $("#user").finish().animate({left: `+=${store.get('avatarSize')}`}, {complete: this.onAnimationComplete});
    }
  }

  changeBoundary = () => {
    store.set('rightBoundary', store.get('leftBoundary') + this.$roomEl.width());
    store.set('bottomBoundary', store.get('topBoundary') + this.$roomEl.height());
  }

  hideRoom = () => {
    this.$roomEl.hide();
    $("#user").remove();
  }

  showRoom = () => {
    this.$roomEl.show();
    this.changeBoundary();
    $(window).on('resize', throttle(this.changeBoundary, 500));
    this.renderUserAvatar();
  }

  draggableUser = () => {
    $("#user").draggable({
      grid: [store.get('avatarSize'), store.get('avatarSize')],
      stop: this.onAnimationComplete,
    });
  }

  onAnimationComplete = () => {
    this.showAdjacentMessages();
    this.sendPositionToPeers();
  }

  sendPositionToPeers = () => {
    store.sendToPeers({
      type: 'position', 
      data: {
        x: $('#user').position().left,
        y: $('#user').position().top,
      }
    });
  }
  
  showAdjacentMessages = () => {
    const {left, top} = $('#user').position();
    const adjacentPositions = [
      `${left}-${top + store.get('avatarSize')}`,
      `${left}-${top - store.get('avatarSize')}`,
      `${left - store.get('avatarSize')}-${top}`,
      `${left + store.get('avatarSize')}-${top}`,
    ]
  
    adjacentPositions.forEach(position => {
      $(`#${store.get('room')}-${position}`).trigger('adjacent');
    })
  }  
}