import store from '@js/store';
import {roomModes} from '@js/constants';
import AgendaTextRecord from './AgendaTextRecord';
import DisappearingTextRecord from './DisappearingTextRecord';
import PersistentTextRecord from './PersistentTextRecord';
import ThreadedTextRecord from './ThreadedTextRecord';
import {addSystemMessage} from '@js/Togethernet/systemMessage';
import sample from 'lodash/sample';
import {createMessage} from '@js/api';

export default class EphemeralMessage {
  constructor (props) {
    const room = store.getRoom(props.roomId);

    this.id = `${props.roomId}-${props.gridColumnStart}-${props.gridRowStart}`;
    this.avatar = props.avatar;
    this.roomId = props.roomId;
    this.gridColumnStart = props.gridColumnStart;
    this.gridRowStart = props.gridRowStart;
    
    this.messageData = props || {};
  }
   
  $textRecord = () => {
    return $(`#${this.id}`);
  }

  renderEphemeralMessageDetails = () => {
    $('.ephemeralMessageContainer').finish().show();
  }

  render = () => {
    const $ephemeralRecord = $(
      `<div \
        class="ephemeralRecord" \ 
        id=${this.id} \
        style="grid-column-start:${this.gridColumnStart};grid-row-start:${this.gridRowStart};" \
      />`
    );

    $ephemeralRecord
      .on('mouseenter', this.renderEphemeralMessageDetails)
      .on('mouseleave', () => $('.ephemeralMessageContainer').finish().fadeOut(500));
    $ephemeralRecord.on('adjacent', this.renderEphemeralMessageDetails);

    $ephemeralRecord.css({backgroundColor: this.avatar});
    $ephemeralRecord.appendTo($(`#${this.roomId}`));
  }
}