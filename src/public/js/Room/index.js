import pull from 'lodash/pull';
import difference from 'lodash/difference';

import store from '@js/store';
import { roomModes } from '@js/constants';

import {keyboardEvent} from './animation';
import {addSystemMessage} from '@js/Togethernet/systemMessage';
import EphemeralMessage from '@js/EphemeralMessage';
import RoomMembership from '@js/RoomMembership';

export default class Room {
  static isEphemeral = true;

  constructor(options) {
    this.mode = options.mode;
    this.roomId = options.roomId.toLowerCase().replaceAll(' ', '-');
    this.ephemeral = options.ephemeral;
    this.facilitators = options.facilitators || [];
    this.$room = $(`#${this.roomId}`);
    this.$roomLink = $(`#${this.roomId}Link`);
    this.memberships = new RoomMembership(this.roomId);

    this.inConsentToArchiveProcess = false;

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
    const $roomLink = $('<button type="button" class="roomLink"></button>');
    const $roomTitle = $('<p></p>');
    $roomTitle.text(this.roomId);
    $roomTitle.appendTo($roomLink);

    if (this.facilitators.includes(store.getCurrentUser().socketId)) {
      this.renderRemoveRoomButton().appendTo($roomTitle);
    }

    const $participantsContainer = $('<div class="participantsContainer"></div>');
    $participantsContainer.appendTo($roomLink);

    $roomLink.appendTo($('.roomsList.ephemeral'));
    this.$roomLink = $roomLink;
  }

  renderRemoveRoomButton = () => {
    const $removeRoomButton = $('<button class="removeRoom">x</button>');
    $removeRoomButton.on('click', () => {
      if (this.facilitators.includes(store.getCurrentUser().socketId)) {
        this.purgeSelf();
        store.sendToPeers({
          type: 'deleteRoom', 
          data: {removedRoom: this.roomId},
        });
      }
    });

    return $removeRoomButton;
  }

  purgeSelf = () => {
    Object.values(this.memberships.members).forEach(member => {
      member.joinedRoom('sitting-at-the-park');
    });

    this.$roomLink.remove();
    this.$room.remove();
    delete store.rooms[this.roomId];
  }

  renderSpace = () => {
    const $room = $(`
      <div \
        class="room ephemeralView" \
        id="${this.roomId}" \
        tabindex="0" \
        style="display:none" \
      > \
        <div 
          class="consentToArchiveOverlay" \
          style="display: none;"\
        ></div>\
      </div>`);
    $room.insertBefore('.sendMessageActions');
    this.$room = $room;
  }

  attachEvents = () => {
    this.$roomLink.on('click', this.goToRoom);
    this.$room.on('hideRoom', this.hideRoom);
    this.$room.on('keydown', keyboardEvent);
  }

  goToRoom = () => {
    $('#archivalSpace').hide();
    $('#downloadArchives').hide();
    $('.ephemeralMessageContainer').finish().hide();
    $('.roomLink').removeClass('currentRoom');
    this.$roomLink.addClass('currentRoom');
    $('.room').each((_, el) => $(el).trigger('hideRoom'));
    this.updateMessageTypes();
    this.addMember(store.getCurrentUser());
    this.showRoom();
    $('#writeMessage').removeAttr('disabled');

    store.sendToPeers({
      type: 'joinedRoom',
      data: {
        joinedRoomId: this.roomId
      }
    });
  }

  addMember = (user) => {
    this.memberships.addMember(user);
  }

  showRoom = () => {
    store.getCurrentUser().updateState({currentRoomId: this.roomId});
    this.$room.show();
    this.$room.focus();
    $('#pinMessage').show();
    
    this.memberships.renderAvatars();

    this.renderHistory();
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
    const newFacilitators = [...this.facilitators];
    pull(newFacilitators, store.getCurrentUser().socketId);

    const $peerAvatar = $(e.target).closest('.avatar');
    const peerId = $peerAvatar.attr('id').split('peer-')[1];
    newFacilitators.push(peerId);

    store.sendToPeers({
      type: 'updateFacilitators',
      data: {
        roomId: this.roomId,
        facilitators: newFacilitators,
      }
    });

    this.updateFacilitators(newFacilitators);
  }

  updateFacilitators = (currentFacilitators) => {
    const currentUser = store.getCurrentUser();
    const newFacilitators = difference(currentFacilitators, this.facilitators);

    newFacilitators.forEach(facilitatorId => {
      const facilitator = currentUser.isMe(facilitatorId) ? currentUser : store.getPeer(facilitatorId);
      const name = facilitator.getProfile().name;
      addSystemMessage(`${name} stepped in as the new facilitator`);
    });

    this.facilitators = currentFacilitators;
    this.updateCloseButtons();
    this.updateMessageTypes();
    this.memberships.renderAvatars();
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
    this.$room.hide();
    $('#user').remove();
  }

  updateSelf = ({mode, ephemeral, roomId, ephemeralHistory}) => {
    this.mode = mode;
    this.ephemeral = ephemeral;
    this.roomId = roomId;
    this.updateEphemeralHistory(ephemeralHistory);
  }

  updateEphemeralHistory = (ephemeralHistoryData = {}) => {
    this.ephemeralHistory = {...this.ephemeralHistory, ...this.createMessageRecords(ephemeralHistoryData)};
    this.renderHistory();
  }

  createMessageRecords = (ephemeralHistoryData = {}) => {
    let ephemeralHistory = {};
    Object.values(ephemeralHistoryData).forEach(({messageData}) => {
      const newMessageRecord = new EphemeralMessage(messageData);
      ephemeralHistory[newMessageRecord.messageData.id] = newMessageRecord;
    });
    return ephemeralHistory;
  }

  updateCloseButtons = () => {
    if (this.facilitators.includes(store.getCurrentUser().socketId)) {
      this.renderRemoveRoomButton().appendTo(this.$roomLink.find('p'));
    } else {
      this.$roomLink.find('.removeRoom').remove();
    }
  }

  updateMessageTypes = () => {
    $('#messageType').find('option[value="agenda"]').remove();
    $('#messageType').removeAttr('data-thread-entry-message');
    if (!this.facilitators.length || this.facilitators.includes(store.getCurrentUser().socketId)) {
      $('<option value="agenda">add an agenda</option>').appendTo($('#messageType'));
    }
  }
}