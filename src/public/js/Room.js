import store from '../store/index.js';
import throttle from 'lodash/throttle';

export default class Room {
  constructor(options) {
    this.mode = options.mode;
    this.ephemeral = options.ephemeral;
    this.name = options.name;
    this.roomId = options.roomId;
    this.$roomEl = null;
  }

  initialize = () => {
    this.renderMenuButton();
    this.renderRoom();
    if (this.ephemeral) {
      this.attachKeyboardEvents();
    }
  }

  renderMenuButton = () => {
    const $roomLink = $('<button type="button" class="tab icon"></button>')
    const $roomTitle = $('<p></p>');
    $roomTitle.text(this.name);
    $roomTitle.appendTo($roomLink);
    $roomLink.on('click', () => {
      $('.chat').each((_, el) => {
        $(el).hide();
      })
      $(`#${this.roomId}`).show();
    })
    $roomLink.insertBefore($('#addRoom'));
  }

  renderRoom = () => {
    const $room = $(`<div class="chat ${this.ephemeral ? 'privateMsg' : 'publicMsg'}" id="${this.roomId}" tabindex="0"></div>`);
    $room.appendTo('#rooms');
    this.$roomEl = $room;

    if (store.get('room') === this.roomId) {
      $room.show();
      store.set('rightBoundary', $room.width());
      store.set('bottomBoundary', $room.height());
      $(window).on('resize', throttle(this.changeBoundary, 500));
    } else {
      $room.hide();
    }
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
    store.set('rightBoundary', store.get('leftBoundary') + this.$room.width());
    store.set('bottomBoundary', store.get('topBoundary') + this.$room.height());
  }
}