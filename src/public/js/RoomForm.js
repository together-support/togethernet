import {roomModes} from '../constants/index.js';
import store from '../store/index.js';
import Room from './Room.js';
import publicConfig from '../config/index.js';

const defaultOptions = {
  mode: publicConfig.defaultMode,
  name: '',
  roomId: '',
  ephemeral: true,
  enableConsentfulGestures: true,
  enableMajorityRule: true,
}

export default class RoomForm {
  constructor () {
    this.options = defaultOptions;

    roomModes.forEach((mode) => {
      $('#meetingMode').append($('<option>').val(mode).text(mode));
    });
  }

  initialize = () => {
    $('#ephemeralArchivalToggle').find('.toggleButton').on('click', this.togglePrivacy);
    $('#consentfulGesturesToggle').find('.toggleButton').on('click', this.toggleConsentfulGestures);
    $('#majorityRulesToggle').find('.toggleButton').on('click', this.toggleMajorityRule);
    $('#newRoomName').on('change', this.updateRoomName);
    $('#meetingMode').on('change', this.changeMeetingMode);
    $('.createNewRoom').on('click', this.createNewRoom);
    $('#customizeRoom').on('click', () => this.goToPage(2));
    $('#backToCreateRoom').on('click', () => this.goToPage(1));

    $('.modalOverlay').on('click', () => {
      $('#configureRoom').hide();
      this.resetForm();
    });
    $('.modalContent').on('click', (e) => e.stopPropagation());

    $("#addRoom").on('click', () => {
      $('#configureRoom').show();
    });
  }

  togglePrivacy = (e) => {
    e.preventDefault();
    this.options.ephemeral = !this.options.ephemeral;
    $('#ephemeralArchivalToggle').find('.toggleContainer').toggleClass('right');
  }

  toggleConsentfulGestures = () => {
    this.options.enableConsentfulGestures = !this.options.enableConsentfulGestures;
    $('#consentfulGesturesToggle').find('.toggleContainer').toggleClass('right');
  }

  toggleMajorityRule = () => {
    this.options.enableMajorityRule = !this.options.enableMajorityRule;
    $('#majorityRulesToggle').find('.toggleContainer').toggleClass('right');
  }

  changeMeetingMode = (e) => {
    e.preventDefault();
    this.options.mode = $('#meetingMode option:selected').val();
  }

  updateRoomName = (e) => {
    e.preventDefault();
    this.options.name = e.target.value;
    this.options.roomId = e.target.value;
  }

  goToPage = (pageNumber) => {
    $('.configureRoomView').hide();
    $(`#configureRoom-${pageNumber}`).show();
  }

  createNewRoom = (e) => {
    e.preventDefault();

    if (this.validateOptions()) {
      const newRoom = new Room(this.options);

      store.rooms[this.options.roomId] = newRoom;
      store.set('currentRoomId', this.options.roomId);
      store.sendToPeers({
        type: 'newRoom',
        data: {
          options: newRoom
        }
      });

      newRoom.initialize();
      newRoom.goToRoom();
      $('#configureRoom').hide();
      this.resetForm()
    }
  }

  validateOptions = () => {
    let isValid = true;
    if (!Boolean(this.options.name)) {
      alert('please enter a room name');
      isValid = false;
    }

    if (Boolean(store.getRoom(this.options.name))) {
      alert('room names must be unique');
      isValid = false;
    }

    return isValid;
  }

  resetForm = () => {
    this.options = defaultOptions;
    $('#meetingMode').val(defaultOptions.mode);
    $('#newRoomName').val(defaultOptions.name);
    $('#configureRoom').find('.toggleContainer').removeClass('right');
    
    this.goToPage(1);
  }
}
