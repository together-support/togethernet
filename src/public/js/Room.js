import store from '../store/index.js';
import throttle from 'lodash/throttle';
import {sendPositionToPeers, showAdjacentMessages} from './positions.js';

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
    if (this.ephemeral) {
      this.attachKeyboardEvents();
    }

    if (this.isCurrentRoom) {
      this.changeBoundary();
    }

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

  onAnimationComplete = () => {
    showAdjacentMessages();
    sendPositionToPeers();
  }

  hideRoom = () => {
    this.$roomEl.hide();
  }

  showRoom = () => {
    this.$roomEl.show();
    this.changeBoundary();
    $(window).on('resize', throttle(this.changeBoundary, 500));
  }
}