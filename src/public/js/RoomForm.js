import {EGALITARIAN_MODE, roomModes} from '../constants/index.js';

export default class RoomForm {
  constructor () {
    this.mode = EGALITARIAN_MODE;
    $('#configureRoom').show();
  }

  initialize = () => {
  }
}