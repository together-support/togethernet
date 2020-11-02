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
  }

  initialize = () => {
    this.initializeMenuButton();
    this.initializeSpace();
    if (this.ephemeral) {
      this.attachKeyboardEvents();
    }
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
    const $room = $(`
      <div
        class="chat ${this.ephemeral ? 'squaresView' : 'listView'}" 
        id="${this.roomId}"
        tabindex="0"
        ${store.get('room') === this.roomId ? '' : 'style="display:none"'}
      >
      </div>
    `);
    $room.appendTo('#rooms');

    $room.on('showRoom', this.showRoom);
    $room.on('hideRoom', this.hideRoom);

    this.$roomEl = $room;
  }

  hideRoom = () => {
    this.$roomEl.hide();
  }

  showRoom = () => {
    this.$roomEl.show();
    store.set('rightBoundary', this.$roomEl.width());
    store.set('bottomBoundary', this.$roomEl.height());
    $(window).on('resize', throttle(this.changeBoundary, 500));
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

  onAnimationComplete = () => {
    showAdjacentMessages();
    sendPositionToPeers();
  }
}