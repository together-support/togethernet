import store from '../store/index.js';
import throttle from 'lodash/throttle';
import {attachKeyboardEvents, renderUserAvatar} from './ephemeral.js';

export default class Room {
  constructor(options) {
    this.mode = options.mode;
    this.ephemeral = options.ephemeral;
    this.name = options.name;
    this.roomId = options.roomId;
    this.$room = null;
    this.isCurrentRoom = store.get('room') === this.roomId;
  }

  initialize = () => {
    this.initializeMenuButton();
    this.$room = this.initializeSpace();

    if (this.isCurrentRoom) {
      this.showRoom();
    }

    this.$room.on('showRoom', this.showRoom);
    this.$room.on('hideRoom', this.hideRoom);
  }

  initializeMenuButton = () => {
    const $roomLink = $('<button type="button" class="tab icon"></button>')
    const $roomTitle = $('<p></p>');
    $roomTitle.text(this.name);
    $roomTitle.appendTo($roomLink);
    $roomLink.on('click', () => {
      $('.chat').each((_, el) => {
        $(el).trigger('hideRoom');
      })
      $(`#${this.roomId}`).trigger('showRoom');
    })
    $roomLink.insertBefore($('#addRoom'));
  }

  initializeSpace = () => {
    const $room = $(`<div class="chat hidden" id="${this.roomId}" tabindex="0"></div>`);
    this.ephemeral ? $room.addClass('squaresView') : $room.addClass('listView');
    $room.appendTo('#rooms');
    if (this.ephemeral) {
      attachKeyboardEvents($room);
    };
    return $room;
  }

  showRoom = () => {
    store.set('room', this.roomId)
    this.$room.show();
    $(window).on('resize', this.onResize);
    
    if (this.ephemeral) {
      renderUserAvatar();
      this.changeBoundary();
    }
  }

  hideRoom = () => {
    $(window).off('resize', this.onResize);
    this.$room.hide();
    $("#user").remove();
  }

  onResize = throttle(() => { 
    this.changeBoundary()
  }, 500);

  changeBoundary = () => {   
    store.set('rightBoundary', store.get('leftBoundary') + this.$room.width());
    store.set('bottomBoundary', store.get('topBoundary') + this.$room.height());
  }
}