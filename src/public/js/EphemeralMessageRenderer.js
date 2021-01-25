import store from '@js/store';
import {roomModes} from '@js/constants';
import isPlainObject from 'lodash/isPlainObject';

class EphemeralMessageRenderer {
  constructor () {
    this.message = null;
  }

  renderMessageDetails = (roomId, messageId) => {
    const room = store.getRoom(roomId);
    const message = room.ephemeralHistory[messageId];
    if (!message) { 
      return;
    } else {
      this.message = message;
    };

    const {id, name, content, socketId} = this.message.messageData;
    const $ephemeralRecordDetails = $(document.getElementById('ephemeralRecordDetailsTemplate').content.cloneNode(true));
    const $messageDetails = $ephemeralRecordDetails.find('.ephemeralRecordDetails');
    $messageDetails.attr('id', `ephemeralDetails-${id}`);
  
    $messageDetails.find('.author').text(name);
    $messageDetails.find('.content').text(content);
  
    if (store.isMe(socketId)) {
      const $removeMessageButton = this.renderCloseButton();
      $removeMessageButton.appendTo($messageDetails.find('.messageActions'));
    }
  
    if (room.mode === roomModes.directAction) {
      const $consentfulGestures = this.renderConsentfulGestures();
      $consentfulGestures.appendTo($messageDetails.find('.votingButtonsContainer'));
    }

    return $ephemeralRecordDetails;
  }

  renderCloseButton = () => {
    const $removeMessageButton = $('<button id="removeMessage">x</button>');
    $removeMessageButton.on('click', () => this.message.purgeSelf());
    return $removeMessageButton
  }

  renderConsentfulGestures = () => {
    const {votes} = this.message.messageData;
    const $consentfulGesturesTemplate = $(document.getElementById('consentfulGesturesTemplate').content.cloneNode(true));
    if (votes && isPlainObject(votes)) {
      Object.keys(votes).forEach(option => {
        $consentfulGesturesTemplate.find(`.voteOption.${option} .voteCount`).text(votes[option]);
      });
    };
  
    $consentfulGesturesTemplate.find('.voteOption').each((_, option) => {
      $(option).on('click', () => {})
    })
   
    return $consentfulGesturesTemplate;
  }
}

const ephemeralMessageRenderer = new EphemeralMessageRenderer();

export default ephemeralMessageRenderer;