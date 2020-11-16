import store from '../store/index.js';
import throttle from 'lodash/throttle';
import {keyboardEvent, renderUserAvatar} from './animatedAvatar.js';
import {renderIncomingEphemeralMessage} from './ephemeralView.js';

export default class Room {
  constructor(options) {
    this.mode = options.mode;
    this.name = options.name;
    this.roomId = options.roomId;
    this.ephemeral = options.ephemeral;
    this.enableConsentfulGestures = options.enableConsentfulGestures;
    this.enableMajorityRule = options.enableMajorityRule;
    this.facilitators = options.facilitators;
    this.$room = $(`#${this.roomId}`);
    this.$roomLink = $(`#${this.roomId}Link`);

    this.ephemeralHistory = {};
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

  renderSpace = () => {
    const $room = $(`<div class="chat hidden" id="${this.roomId}" tabindex="0"></div>`);
    this.ephemeral ? $room.addClass('squaresView') : $room.addClass('listView');
    $room.appendTo('#rooms');
    this.$room = $room;
  }

  attachEvents = () => {
    this.$roomLink.on('click', this.goToRoom);

    if (this.ephemeral) {
      this.setBoundary();
      this.$room.on('keydown', keyboardEvent)
    };

    this.$room.on('showRoom', this.showRoom);
    this.$room.on('hideRoom', this.hideRoom);
  }

  goToRoom = () => {
    $('.chat').each((_, el) => $(el).trigger('hideRoom'));
    this.$room.trigger('showRoom');
  }

  showRoom = () => {
    store.set('currentRoomId', this.roomId);

    this.$room.show();
    $(window).on('resize', this.onResize);
    
    if (this.ephemeral) {
      renderUserAvatar();
      this.setBoundary();
    }
    
    this.renderHistory();

    store.sendToPeers({
      type: 'joinedRoom',
      data: {
        joinedRoomId: this.roomId
      }
    });
  }

  renderHistory = () => {
    if (this.ephemeral) {
      Object.keys(this.ephemeralHistory).forEach((messageRecordId) => {
        if (!this.$room.find(`#${messageRecordId}`).length) {
          renderIncomingEphemeralMessage({...this.ephemeralHistory[messageRecordId], roomId: this.roomId});
        }
      });
    }
  }

  addEphemeralHistory = (data) => {
    const {x, y, roomId} = data;
    const id = `${roomId}-${x}-${y}`;
    this.ephemeralHistory[id] = {...data};
  }

  removeEphemeralHistory = (messageId) => {
    delete this.ephemeralHistory[messageId];
  }

  hideRoom = () => {
    $(window).off('resize', this.onResize);
    this.$room.hide();
    $("#user").remove();
  }

  onResize = throttle(() => { 
    this.setBoundary()
  }, 500);

  setBoundary = () => {   
    store.set('rightBoundary', store.get('leftBoundary') + this.$room.width());
    store.set('bottomBoundary', store.get('topBoundary') + this.$room.height());
  }

  updateSelf = ({mode, ephemeral, name, ephemeralHistory}) => {
    this.mode = mode;
    this.ephemeral = ephemeral
    this.name = name;
    this.ephemeralHistory = {...this.ephemeralHistory, ...ephemeralHistory}
    this.renderHistory();
  }
}