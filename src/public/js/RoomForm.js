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

    $('.modalOverlay').on('click', () => $('#configureRoom').hide());
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
    this.roomId = camelCase(e.target.value);
  }

  createNewRoom = (e) => {
    e.preventDefault();
    const newRoom = new Room({
      mode: this.mode,
      ephemeral: this.ephemeral,
      name: this.name,
      roomId: this.roomId,
    });

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
  }

  resetForm = () => {
    this.mode = EGALITARIAN_MODE;
    this.name = '';
    this.roomId = '';
    this.ephemeral = true;
  }
}