import store from '../store/index.js';
import throttle from 'lodash/throttle';
import pull from 'lodash/pull';
import {keyboardEvent} from './animatedAvatar.js';
import { roomModes } from '../constants/index.js';
import {addSystemMessage} from './systemMessage.js';
import EphemeralMessageRecord from './messageRecords/EphemeralMessageRecord.js';

export default class Room {
  constructor(options) {
    this.mode = options.mode;
    this.name = options.name;
    this.roomId = options.roomId;
    this.ephemeral = options.ephemeral;
    this.facilitators = options.facilitators || [];
    this.$room = $(`#${this.roomId}`);
    this.$roomLink = $(`#${this.roomId}Link`);
    this.members = {...options.members};

    this.ephemeralHistory = {...this.createMessageRecords(options.ephemeralHistory)};
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
    const $roomLink = $('<button type="button" class="roomLink icon"></button>');

    const $roomTitle = $('<p></p>');
    $roomTitle.text(this.name);
    $roomTitle.appendTo($roomLink);

    const $participantsContainer = $('<div class="participantsContainer"></div>');
    $participantsContainer.appendTo($roomLink);

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
    this.$room.on('showRoom', this.showRoom);
    this.$room.on('hideRoom', this.hideRoom);

    if (this.ephemeral) {
      this.setBoundary();
      this.$room.on('keydown', keyboardEvent);
    }
  }

  goToRoom = () => {
    $('.chat').each((_, el) => $(el).trigger('hideRoom'));
    this.updateMessageTypes();
    this.addMember(store.getCurrentUser());
    this.$room.trigger('showRoom');

    store.sendToPeers({
      type: 'joinedRoom',
      data: {
        joinedRoomId: this.roomId
      }
    });
  }

  addMember = (member) => {
    const {socketId} = member;
    Object.values(store.get('rooms')).forEach(room => delete room.members[socketId]);
    member.state.currentRoomId = this.roomId;
    this.members[socketId] = member
    member.render();
    member.renderParticipantAvatar();
  }

  showRoom = () => {
    store.getCurrentUser().updateState({currentRoomId: this.roomId});
    this.$room.show();
    $(window).on('resize', this.onResize);
    
    if (this.ephemeral) {
      this.renderAvatars();
      this.setBoundary();
    }
    
    this.renderHistory();
  }

  renderAvatars = () => {
    Object.values(this.members).forEach(member => {
      member.currentRoomId = this.roomId;
      member.render()
    });
  }

  hasFeature = (feature) => {
    if (feature === 'facilitators') {
      return this.mode === roomModes.directAction || this.mode === roomModes.facilitated;
    }
  }

  hasFacilitator = (socketId) => {
    return this.facilitators.includes(socketId);
  }

  onTransferFacilitator = (e) => {
    const $peerAvatar = $(e.target).closest('.avatar');
    $peerAvatar.empty();
    const peerId = $peerAvatar.attr('id').split('peer-')[1];
    addSystemMessage(`${store.getPeer(peerId).state.name} stepped in as a new facilitator`);
    pull(this.facilitators, store.getCurrentUser().socketId);
    this.facilitators.push(peerId);

    store.sendToPeers({
      type: 'updateFacilitators',
      data: {
        roomId: this.roomId,
        facilitators: this.facilitators,
      }
    });

    this.updateMessageTypes();
  }
  
  renderHistory = () => {
    if (this.ephemeral) {
      Object.values(this.ephemeralHistory).forEach((messageRecord) => messageRecord.render());
    }
  }

  addEphemeralHistory = (textRecord) => {
    const {id} = textRecord.messageData;
    this.ephemeralHistory[id] = textRecord;
    return this.ephemeralHistory[id];
  }

  removeEphemeralHistory = (messageId) => {
    delete this.ephemeralHistory[messageId];
  }

  hideRoom = () => {
    $(window).off('resize', this.onResize);
    this.$room.hide();
    $('#user').remove();
  }

  onResize = throttle(() => { 
    this.setBoundary();
  }, 500);

  setBoundary = () => {   
    store.set('rightBoundary', store.get('leftBoundary') + this.$room.width());
    store.set('bottomBoundary', store.get('topBoundary') + this.$room.height());
  }

  updateSelf = ({mode, ephemeral, name, ephemeralHistory, members}) => {
    this.mode = mode;
    this.ephemeral = ephemeral;
    this.name = name;
    this.members = {...this.members, ...members};
    this.updateEphemeralHistory(ephemeralHistory);
  }

  updateEphemeralHistory = (ephemeralHistoryData = {}) => {
    this.ephemeralHistory = {...this.ephemeralHistory, ...this.createMessageRecords(ephemeralHistoryData)};
    this.renderHistory();
  }

  createMessageRecords = (ephemeralHistoryData = {}) => {
    let ephemeralHistory = {};
    Object.values(ephemeralHistoryData).forEach(({messageData}) => {
      const newMessageRecord = new EphemeralMessageRecord(messageData);
      ephemeralHistory[newMessageRecord.messageData.id] = newMessageRecord;
    });
    return ephemeralHistory;
  }

  updateFacilitators = (facilitators) => {
    const me = store.getCurrentUser();
    facilitators.forEach(facilitator => {
      if (!this.hasFacilitator(facilitator)) {
        const name = me.isMe(facilitator) ? me.getState().name : store.getPeer(facilitator).state.name;
        addSystemMessage(`${name} stepped in as the new facilitator`);
      }
    });

    this.facilitators = facilitators;
    this.updateMessageTypes();

    if (this.hasFacilitator(store.getCurrentUser().socketId)) {
      this.renderAvatars();
    }
  }

  updateMessageTypes = () => {
    $('#messageType').find('option[value="agenda"]').remove();
    if (!this.facilitators.length || this.facilitators.includes(store.getCurrentUser().socketId)) {
      $('<option value="agenda">add an agenda</option>').appendTo($('#messageType'));
    }
  }
}