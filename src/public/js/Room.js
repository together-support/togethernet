import store from '../store/index.js';
import throttle from 'lodash/throttle';
import pull from 'lodash/pull';
import {keyboardEvent} from './animatedAvatar.js';
import {renderIncomingEphemeralMessage, renderAvatar} from './ephemeralView.js';
import {participantAvatar} from '../components/users.js'
import { roomModes } from '../constants/index.js';
import {addSystemMessage} from './systemMessage.js';

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

    this.ephemeralHistory = {...options.ephemeralHistory};
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
      this.$room.on('keydown', keyboardEvent)
    };
  }

  goToRoom = () => {
    $('.chat').each((_, el) => $(el).trigger('hideRoom'));
    this.updateMessageTypes();
    this.addMember(store.getProfile());
    this.$room.trigger('showRoom');

    store.sendToPeers({
      type: 'joinedRoom',
      data: {
        joinedRoomId: this.roomId
      }
    });
  }

  addMember = (profile) => {
    const {socketId} = profile;
    Object.values(store.get('rooms')).forEach(room => delete room.members[socketId]);
    this.members[socketId] = profile;
    if (this.ephemeral) {
      renderAvatar(profile);
    }
    const participantDisplay = $(`#participant-${socketId}`).length ? $(`#participant-${socketId}`) : participantAvatar(profile);
    participantDisplay.appendTo(this.$roomLink.find('.participantsContainer'))
  }

  showRoom = () => {
    store.set('currentRoomId', this.roomId);

    this.$room.show();
    $(window).on('resize', this.onResize);
    
    if (this.ephemeral) {
      this.renderAvatars();
      this.setBoundary();
    }
    
    this.renderHistory();
  }

  renderAvatars = () => {
    Object.values(this.members).forEach(member => renderAvatar({...member, roomId: this.roomId}));
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
    addSystemMessage(`${store.getPeer(peerId).profile.name} stepped in as a new facilitator`);
    pull(this.facilitators, store.get('socketId'));
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
      Object.keys(this.ephemeralHistory).forEach((messageRecordId) => {
        if (!this.$room.find(`#${messageRecordId}`).length) {
          renderIncomingEphemeralMessage({...this.ephemeralHistory[messageRecordId], roomId: this.roomId});
        }
      });
    }
  }

  addEphemeralHistory = (data) => {
    const {x, y, roomId, votes, votingRecords} = data;
    const id = `${roomId}-${x}-${y}`;
    this.ephemeralHistory[id] = {...data};
    if (this.ephemeral && this.mode === roomModes.directAction) {
      this.ephemeralHistory[id]['votingRecords'] = votingRecords || {};
      this.ephemeralHistory[id]['votes'] = votes || {
        agree: 0,
        disagree: 0,
        stand: 0,
        block: 0,
      };
    } 

    return this.ephemeralHistory[id];
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

  updateSelf = ({mode, ephemeral, name, ephemeralHistory, members}) => {
    this.mode = mode;
    this.ephemeral = ephemeral;
    this.name = name;
    this.ephemeralHistory = {...this.ephemeralHistory, ...ephemeralHistory}
    this.members = {...this.members, ...members}
    this.renderHistory();
  }

  updateFacilitators = (facilitators) => {
    facilitators.forEach(facilitator => {
      if (!this.hasFacilitator(facilitator)) {
        const name = facilitator === store.get('socketId') ? store.getProfile().name : store.getPeer(facilitator).profile.name;
        addSystemMessage(`${name} stepped in as the new facilitator`);
      }
    });

    this.facilitators = facilitators;
    this.updateMessageTypes();

    if (this.hasFacilitator(store.get('socketId'))) {
      this.renderAvatars();
    }
  }

  updateMessageTypes = () => {
    $('#messageType').find('option[value="agenda"]').remove();
    if (!this.facilitators.length || this.facilitators.includes(store.get('socketId'))) {
      $('<option value="agenda">add an agenda</option>').appendTo($('#messageType'));
    }
  }
}