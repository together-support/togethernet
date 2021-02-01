import store from '@js/store';
import {roomModes} from '@js/constants';
import isPlainObject from 'lodash/isPlainObject';

class EphemeralMessageRenderer {
  renderEphemeralDetails = (roomId, messageId) => {
    const room = store.getRoom(roomId);
    const message = room.ephemeralHistory[messageId];
    if (!message) { 
      return;
    }

    const myId = store.getCurrentUser().socketId;

    const {id, name, content, socketId, canVote, archivedMessageId, consentToArchiveRecords = {}} = message.messageData;
    const $ephemeralRecordDetails = $(document.getElementById('ephemeralRecordDetailsTemplate').content.cloneNode(true));
    const $messageDetails = $ephemeralRecordDetails.find('.ephemeralRecordDetails');
    $messageDetails.attr('id', `ephemeralDetails-${id}`);
  
    $messageDetails.find('.author').text(name);
    $messageDetails.find('.content').text(content);
  
    if (store.isMe(socketId)) {
      const $removeMessageButton = this.renderCloseButton(message);
      $removeMessageButton.appendTo($messageDetails.find('.messageActions'));
    }
  
    if (room.mode === roomModes.directAction) {
      const $consentfulGestures = this.renderConsentfulGestures(message);
      $consentfulGestures.appendTo($messageDetails.find('.votingButtonsContainer'));
    }

    if (room.mode === roomModes.facilitated && room.facilitators.includes(myId) && !canVote) {
      const $makeVoteButton = this.renderCreatePollButton(message);
      $makeVoteButton.appendTo($messageDetails.find('.messageActions'));
    }

    if (room.mode === roomModes.facilitated && canVote) {
      const $majorityRulesButtons = this.renderMajorityRulesButtons(message);
      $majorityRulesButtons.appendTo($messageDetails.find('.votingButtonsContainer'));
    }

    if (!archivedMessageId || Object.keys(consentToArchiveRecords).includes(store.getCurrentUser().socketId)) {
      const $consentToArchiveButton = this.renderConsentToArchiveButton(message);
      $consentToArchiveButton.appendTo($messageDetails.find('.messageActions'));
    }

    return $ephemeralRecordDetails;
  }

  renderCloseButton = (message) => {
    const $removeMessageButton = $('<button>x</button>');
    $removeMessageButton.on('click', () => {
      message.purgeSelf();
    });
    return $removeMessageButton;
  }

  renderConsentfulGestures = (message) => {
    const {votes} = message.messageData;
    
    const $consentfulGesturesTemplate = $(document.getElementById('consentfulGesturesTemplate').content.cloneNode(true));
    if (isPlainObject(votes)) {
      Object.keys(votes).forEach(option => {
        $consentfulGesturesTemplate.find(`.voteOption.${option} .voteCount`).text(votes[option]);
      });
    }

    $consentfulGesturesTemplate.find('.voteOption').each((_, option) => {
      $(option).on('click', () => {
        $(option).toggleClass('myVote');
        $('.voteOption').not(`.${$(option).data('value')}`).removeClass('myVote');
        message.castVote($(option).data('value'));
      });
    });
   
    return $consentfulGesturesTemplate;
  }

  renderCreatePollButton = (message) => {
    const $makeVoteButton = $('<button class="makeVote"><i class="fas fa-check"></i></button>');

    $makeVoteButton.on('click', (e) => {
      message.createPoll();
      (e.target).closest('.makeVote').remove();
    });

    return $makeVoteButton;
  }

  renderMajorityRulesButtons = (message) => {
    const {votes} = message.messageData;
    
    const $majorityRulesTemplate = $(document.getElementById('majorityRulesTemplate').content.cloneNode(true));
    if (isPlainObject(votes)) {
      Object.keys(votes).forEach(option => {
        $majorityRulesTemplate.find(`.voteOption.${option} .voteCount`).text(votes[option]);
      });
    }

    $majorityRulesTemplate.find('.voteOption').each((_, option) => {
      $(option).on('click', () => {
        $(option).toggleClass('myVote');
        $('.voteOption').not(`.${$(option).data('value')}`).removeClass('myVote');
        message.castVote($(option).data('value'));
      });
    });
   
    return $majorityRulesTemplate;
  }

  renderConsentToArchiveButton = (message) => {
    const {archivedMessageId, consentToArchiveRecords = {}} = message.messageData;
    const $consentToArchiveButton = $('<button class="initConsentToArchiveProcess"><i class="fas fa-align-justify"></i></button>');
    if (archivedMessageId && Object.keys(consentToArchiveRecords).includes(store.getCurrentUser().socketId)) {
      $consentToArchiveButton.addClass('checked');
      $consentToArchiveButton.on('click', () => {
        // revoke consent
      });
    } else {
      $consentToArchiveButton.on('click', (e) => {
        e.stopPropagation();
        message.initiateConsentToArchiveProcess();
      });
    }

    return $consentToArchiveButton;
  }
}

const ephemeralMessageRenderer = new EphemeralMessageRenderer();

export default ephemeralMessageRenderer;