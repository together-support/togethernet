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
    $('input[type=radio][name=roomMode]').change(this.changeMeetingMode);
    $('.createNewRoom').on('click', this.createNewRoom);
    $('#backToCustomize').on('click', () => this.goToPage(1));
    $('#addFacilitator').on('click', () => this.goToPage(2));
    
    $('.modalOverlay').on('click', () => {
      $('#configureRoom').hide();
      this.resetForm();
    });
    $('.modalContent').on('click', (e) => e.stopPropagation());

    $('#addRoom').on('click', () => {
      this.listFacilitatorOptions();
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

  changeMeetingMode = (e) => {
    this.options.mode = e.target.value;
    if (this.options.mode === roomModes.egalitarian) {
      this.clearFacilitators();
      $('#configureFacilitators').hide();
    } else {
      $('#currentFacilitators').html(renderFacilitator(store.getCurrentUser().getProfile()));
      this.options.facilitators = [store.getCurrentUser().socketId];
      $('#configureFacilitators').show();
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
    $('#meetingMode').find('input').each((_, el) => {
      if ($(el).val() === defaultOptions.mode) {
        $(el).prop('checked', true);
      } else {
        $(el).removeAttr('checked');
      }
    });

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
