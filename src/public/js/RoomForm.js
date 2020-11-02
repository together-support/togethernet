import {EGALITARIAN_MODE, roomModes} from '../constants/index.js';
import camelCase from 'lodash/camelCase';
import store from '../store/index.js';
import Room from './Room.js';

export default class RoomForm {
  constructor () {
    this.mode = EGALITARIAN_MODE;
    this.name = '';
    this.roomId = '';
    this.ephemeral = true;

    roomModes.forEach((mode) => {
      $('#meetingMode').append($('<option>').val(mode).text(mode));
    });

    $('#configureRoom').show();
  }

  initialize = () => {
    $('#newRoomName').on('change', this.updateRoomName);
    $('#createNewRoom').on('click', this.createNewRoom);
  }

  updateRoomName = (e) => {
    this.name = e.target.value;
    this.roomId = camelCase(e.target.value);
  }

  createNewRoom = () => {
    const configs = {
      mode: this.mode,
      ephemeral: this.ephemeral,
      name: this.name,
      roomId: this.roomId,
    };
    store.set('room', this.roomId);
    store.rooms[this.roomId] = configs;

    $('#configureRoom').hide();
    new Room(configs).initialize();
  }
}