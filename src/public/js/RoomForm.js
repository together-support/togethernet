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
      $('#meetingMode').append($(`\
        <div>\
          <input type="radio" id="roomMode-${mode}" name="roomMode" value="${mode}" ${mode === publicConfig.defaultMode && 'checked="checked"'}></input>\
          <label for="${mode}">${mode}</label>\
        </div>\
      `));
    });
  }

  initialize = () => {
    $('#newRoomName').on('change', this.updateRoomName);
    $('input[type=radio][name=roomMode]').on('change', this.changeMeetingMode);
    $('.createNewRoom').on('click', this.createNewRoom);
    $('#backToCustomize').on('click', () => this.goToPage(1));
    $('#addFacilitator').on('click', () => {
      this.listFacilitatorOptions();
      this.goToPage(2)
    });
    
    $('.modalOverlay').on('click', () => {
      $('#configureRoom').hide();
      this.resetForm();
    });
    $('.modalContent').on('click', (e) => e.stopPropagation());

    $('#addRoom').on('click', () => {
      $('#configureRoom').show();
    });
  }

  listFacilitatorOptions = () => {
    $('#configureRoom-2').find('.facilitatorOption').remove();
    const profiles = [store.getCurrentUser().getProfile(), ...Object.values(store.get('peers')).map(peer => peer.profile)];
    profiles.forEach((profile) => {
      facilitatorOption({
        profile, 
        onClick: () => this.toggleFacilitator(profile),
        selected: this.options.facilitators.includes(profile.socketId)
      }).insertBefore($('#configureRoom-2 .modalButtons'));
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

  changeMeetingMode = (e) => {
    this.options.mode = e.target.value;
    if (this.options.mode === roomModes.egalitarian) {
      this.clearFacilitators();
      $('#configureFacilitators').hide();
      $('#votingModuleInfo').hide();
      $('#consentfulGestureInfo').hide();
    } else if (this.options.mode === roomModes.facilitated) {
      $('#currentFacilitators').html('');
      renderFacilitator(store.getCurrentUser().getProfile()).appendTo($('#currentFacilitators'));
      this.options.facilitators = [store.getCurrentUser().socketId];
      $('#configureFacilitatorsDA').hide();
      $('#configureFacilitatorsFac').show();
      $('#configureFacilitators').show();
      $('#consentfulGestureInfo').hide();
      $('#votingModuleInfo').show();
    } else if (this.options.mode === roomModes.directAction){
      this.clearFacilitators();
      $('#configureFacilitatorsFac').hide();
      $('#configureFacilitatorsDA').show();
      $('#configureFacilitators').show();
      $('#votingModuleInfo').hide();
      $('#consentfulGestureInfo').show();
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
    $(`#roomMode-${defaultOptions.mode}`).prop('checked', true).trigger('click');

    $('#configureFacilitators').hide();
    $('#newRoomName').val(defaultOptions.name);
    $('#configureRoom-2').find('.facilitatorOption').remove();
    this.clearFacilitators();

    this.goToPage(1);
  }

  clearFacilitators = () => {
    this.options.facilitators = [];
    $('.facilitatorOption').removeClass('selected');
    $('#currentFacilitators').find('.facilitatorOption').remove();
  }
}
