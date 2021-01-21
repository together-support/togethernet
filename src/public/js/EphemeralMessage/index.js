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
    this.messageData = {
      ...props, 
      id: `${props.roomId}-${props.gridColumnStart}-${props.gridRowStart}`,
    };
  }
   
  $textRecord = () => {
    return $(`#${this.messageData.id}`);
  }

  renderEphemeralMessageDetails = () => {
    $('.ephemeralMessageContainer').finish().show();
  }

  render = () => {
    const $ephemeralRecord = $(
      `<div \
        class="ephemeralRecord" \ 
        id=${this.messageData.id} \
        style="grid-column-start:${this.messageData.gridColumnStart};grid-row-start:${this.messageData.gridRowStart};" \
      />`
    );

    $ephemeralRecord
      .on('mouseenter', this.renderEphemeralMessageDetails)
      .on('mouseleave', () => $('.ephemeralMessageContainer').finish().fadeOut(500));
    $ephemeralRecord.on('adjacent', this.renderEphemeralMessageDetails);

    $ephemeralRecord.css({backgroundColor: this.messageData.avatar});
    $ephemeralRecord.appendTo($(`#${this.messageData.roomId}`));
  }
}