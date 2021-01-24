import store from '@js/store';
import {roomModes} from '@js/constants';

const renderEphemeralDetails = (messageData) => {
  const {id, roomId, name, content, socketId} = messageData;
  const room = store.getRoom(roomId);
  const $ephemeralRecordDetails = $(document.getElementById('ephemeralRecordDetailsTemplate').content.cloneNode(true));
  const $messageDetails = $ephemeralRecordDetails.find('.ephemeralRecordDetails');
  $messageDetails.attr('id', `ephemeralDetails-${id}`);

  $messageDetails.find('.author').text(name);
  $messageDetails.find('.content').text(content);

  if (store.isMe(socketId)) {
    const $removeMessageButton = $('<button id="removeMessage">x</button>');
    $removeMessageButton.on('click', () => removeMessageRecord(roomId, id))
    $removeMessageButton.appendTo($messageDetails.find('.messageActions'));
  }

  if (room.mode === roomModes.directAction) {
    consentfulGesturesTemplate = $(document.getElementById('consentfulGesturesTemplate').content.cloneNode(true));
    consentfulGesturesTemplate.find('.votingButtons').appendTo($messageDetails.find('.votes'));
  }
  
  return $ephemeralRecordDetails;
}

export const removeMessageRecord = (roomId, id) => {
  const message = store.getRoom(roomId).ephemeralHistory[id];
  message.purgeSelf();
}

export default renderEphemeralDetails;