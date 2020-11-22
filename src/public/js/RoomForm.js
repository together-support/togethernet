import {roomModes} from '../constants/index.js';
import store from '../store/index.js';
import Room from './Room.js';
import publicConfig from '../config/index.js';
import {renderFacilitator, facilitatorOption} from '../components/room.js';
import pull from 'lodash/pull';

const defaultOptions = {
  mode: publicConfig.defaultMode,
  name: '',
  roomId: '',
  ephemeral: true,
  facilitators: [],
};

export default class RoomForm {
  constructor () {
    this.options = {...defaultOptions};

    Object.values(roomModes).forEach((mode) => {
      $('#meetingMode').append($('<option>').val(mode).text(mode));
    });
  }

  initialize = () => {
    $('#ephemeralArchivalToggle').find('.toggleButton').on('click', this.togglePrivacy);
    $('#newRoomName').on('change', this.updateRoomName);

    $('#meetingMode').on('privacyChanged', this.privacyChanged);
    $('#meetingMode').on('change', this.changeMeetingMode);

    $('.createNewRoom').on('click', this.createNewRoom);
    $('#customizeRoom').on('click', () => {
      if (this.options.mode === roomModes.directAction || this.options.mode === roomModes.facilitated) {
        $('#configureFacilitators').show();
      } else {
        $('#configureFacilitators').hide();
      }
      this.goToPage(2);
    });
    $('#backToCreateRoom').on('click', () => this.goToPage(1));
    $('#backToCustomize').on('click', () => this.goToPage(2));
    $('#addFacilitator').on('click', () => this.goToPage(3));
    
    $('.modalOverlay').on('click', () => {
      $('#configureRoom').hide();
      this.resetForm();
    });
    $('.modalContent').on('click', (e) => e.stopPropagation());

    $('#addRoom').on('click', () => {
      this.listFacilitatorOptions();
      renderFacilitator(store.getCurrentUser().getProfile()).appendTo($('#currentFacilitators'));
      this.options.facilitators.push(store.getCurrentUser().socketId);
      $('#configureRoom').show();
    });
  }

  listFacilitatorOptions = () => {
    const profiles = [store.getCurrentUser().getProfile(), ...Object.values(store.get('peers')).map(peer => peer.profile)];
    profiles.forEach((profile) => {
      facilitatorOption({
        profile, 
        onClick: () => this.toggleFacilitator(profile),
      }).insertBefore($('#configureRoom-3 .modalButtons'));
    });
  };

  toggleFacilitator = (profile) => {
    const {socketId} = profile;
    if (this.options.facilitators.includes(socketId)) {
      pull(this.options.facilitators, socketId);
      $('#currentFacilitators').find(`div[data-socketId="${socketId}"]`).remove();
    } else if (this.options.facilitators.length < 3) {
      renderFacilitator(profile).appendTo($('#currentFacilitators'));
      this.options.facilitators.push(socketId);
    }
  }

  togglePrivacy = () => {
    this.options.ephemeral = !this.options.ephemeral;
    $('#ephemeralArchivalToggle').find('.toggleContainer').toggleClass('right');
    $('#meetingMode').trigger({type: 'privacyChanged', ephemeral: this.options.ephemeral});
  }

  privacyChanged = (e) => {
    if (e.ephemeral) {
      $('#configureMeetingMode').show();
    } else {
      $('#configureMeetingMode').hide();
      $('#meetingMode').val(publicConfig.defaultMode).trigger('change');
    }
  }

  changeMeetingMode = (e) => {
    e.preventDefault();
    this.options.mode = $('#meetingMode option:selected').val();
    if (this.options.mode === roomModes.egalitarian) {
      $('#configureMajorityRules').hide();
      $('#configureConsentfulGestures').hide();
      this.clearFacilitators();
      $('#customizeRoom').hide();
    } else if (this.options.mode === roomModes.directAction) {
      $('#configureMajorityRules').hide();
      $('#configureConsentfulGestures').show();
      $('#customizeRoom').show();
    } else if (this.options.mode === roomModes.facilitated) {
      $('#configureConsentfulGestures').hide();
      $('#configureMajorityRules').show();
      $('#customizeRoom').show();
    }
  }

  updateRoomName = (e) => {
    e.preventDefault();
    this.options.name = e.target.value;
    this.options.roomId = e.target.value;
  };

  goToPage = (pageNumber) => {
    $('.configureRoomView').hide();
    $(`#configureRoom-${pageNumber}`).show();
  }

  createNewRoom = (e) => {
    e.preventDefault();

    if (this.validateOptions()) {
      const newRoom = new Room(this.options);
      const {roomId} = this.options;

      store.rooms[roomId] = newRoom;
      store.getCurrentUser().updateState({currentRoomId: roomId});
      store.sendToPeers({
        type: 'newRoom',
        data: {
          options: newRoom
        }
      });

      newRoom.initialize();
      newRoom.goToRoom();
      $('#configureRoom').hide();
      this.resetForm();
    }
  }

  validateOptions = () => {
    let isValid = true;
    if (!this.options.name) {
      alert('please enter a room name');
      isValid = false;
    }

    if (store.getRoom(this.options.name)) {
      alert('room names must be unique');
      isValid = false;
    }

    return isValid;
  }

  resetForm = () => {
    this.options = {...defaultOptions};
    $('#meetingMode').val(defaultOptions.mode);
    $('#newRoomName').val(defaultOptions.name);
    $('#configureRoom').find('.toggleContainer').removeClass('right');
    $('#configureRoom-3').find('.facilitatorOption').remove();
    this.clearFacilitators();

    this.goToPage(1);
  }

  clearFacilitators = () => {
    this.options.facilitators = [];
    $('.facilitatorOption').removeClass('selected');
    $('#currentFacilitators').find('.facilitatorOption').remove();
  }
}
