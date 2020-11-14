import {EGALITARIAN_MODE, roomModes} from '../constants/index.js';
import camelCase from 'lodash/camelCase';
import store from '../store/index.js';
import Room from './Room.js';
import publicConfig from '../config/index.js';

export default class RoomForm {
  constructor () {
    this.mode = publicConfig.defaultMode;
    this.name = '';
    this.roomId = '';
    this.ephemeral = true;

    roomModes.forEach((mode) => {
      $('#meetingMode').append($('<option>').val(mode).text(mode));
    });
  }

  initialize = () => {
    $('#configureRoom').find('.toggleButton').on('click', this.togglePrivacy);
    $('#newRoomName').on('change', this.updateRoomName);
    $('#meetingMode').on('change', this.changeMeetingMode);
    $('#createNewRoom').on('click', this.createNewRoom);
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
    this.ephemeral = !this.ephemeral;
    $('#configureRoom').find('.toggleContainer').toggleClass('archival');
  }

  changeMeetingMode = (e) => {
    e.preventDefault();
    this.mode = $('#meetingMode option:selected').val();
  }

  updateRoomName = (e) => {
    e.preventDefault();
    this.name = e.target.value;
    this.roomId = e.target.value;
  }

  goToPage = (pageNumber) => {
    $('.configureRoomView').hide();
    $(`#configureRoom-${pageNumber}`).show();
  }

  createNewRoom = (e) => {
    e.preventDefault();
    const options = {
      mode: this.mode,
      ephemeral: this.ephemeral,
      name: this.name,
      roomId: this.roomId,
    }

    if (this.validateOptions()) {
      const newRoom = new Room(options);

      store.rooms[this.roomId] = newRoom;
      store.set('currentRoomId', this.roomId);
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
    if (!Boolean(this.name)) {
      alert('please enter a room name');
      isValid = false;
    }

    if (Boolean(store.getRoom(this.name))) {
      alert('room names must be unique');
      isValid = false;
    }

    return isValid;
  }

  resetForm = () => {
    this.mode = EGALITARIAN_MODE;
    $('#meetingMode').val(this.mode);

    this.name = '';
    this.roomId = '';
    $('#newRoomName').val(this.name);

    this.ephemeral = true;
    $('#configureRoom').find('.toggleContainer').removeClass('archival');
  }
}
