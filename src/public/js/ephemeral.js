import store from '../store/store.js';
import {removeAllSystemMessage} from './systemMessage.js';
import {myTextRecord} from '../components/message.js';

export const renderOutgoingEphemeralMessage = (data) => {
  removeAllSystemMessage();
  const outgoingMessage = myTextRecord(data)
  outgoingMessage.appendTo($(`#${store.get('room')}`));
}