import store from '../store/index.js';
import throttle from 'lodash/throttle';
import {attachKeyboardEvents, renderUserAvatar} from './ephemeral.js';

export default class Room {
  constructor(options) {
    this.mode = options.mode;
    this.ephemeral = options.ephemeral;
    this.name = options.name;
    this.roomId = options.roomId;
    this.$room = $(`#${this.roomId}`);
    this.$roomLink = $(`#${this.roomId}Link`);
  }

  initialize = () => {
    this.render();
    this.attachEvents();
  }

  render = () => {
    this.renderMenuButton();
    this.renderSpace();
  }

  renderMenuButton = () => {
    const $roomLink = $('<button type="button" class="tab icon"></button>')
    const $roomTitle = $('<p></p>');
    $roomTitle.text(this.name);
    $roomTitle.appendTo($roomLink);
    $roomLink.insertBefore($('#addRoom'));
    this.$roomLink = $roomLink;
  }

  initializeSpace = () => {
    const $room = $(`<div class="chat hidden" id="${this.roomId}" tabindex="0"></div>`);
    this.ephemeral ? $room.addClass('squaresView') : $room.addClass('listView');
    $room.appendTo('#rooms');
    this.$room = $room;
  }

  attachEvents = () => {
    this.$roomLink.on('click', this.goToRoom);
    if (this.ephemeral) {
      attachKeyboardEvents(this.$room);
    };

    this.$room.on('showRoom', this.showRoom);
    this.$room.on('hideRoom', this.hideRoom);
  }

  goToRoom = () => {
    $('.chat').each((_, el) => $(el).trigger('hideRoom'));
    this.$room.trigger('showRoom');
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