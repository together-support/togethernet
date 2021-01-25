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

    const myId = store.getCurrentUser().socketId;

    const {id, name, content, socketId, canVote} = this.message.messageData;
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

    if (room.mode === roomModes.facilitated && room.facilitators.includes(myId) && !canVote) {
      const $makeVoteButton = this.renderCreatePollButton();
      $makeVoteButton.appendTo($messageDetails.find('.messageActions'));
    }

    if (room.mode === roomModes.facilitated && canVote) {
      const $majorityRulesButtons = this.renderMajorityRulesButtons();
      $majorityRulesButtons.appendTo($messageDetails.find('.votingButtonsContainer'));
    }

    const $consentToArchiveButton = this.renderConsentToArchiveButton();
    $consentToArchiveButton.appendTo($messageDetails.find('.messageActions'));

    return $ephemeralRecordDetails;
  }

  renderCloseButton = () => {
    const $removeMessageButton = $('<button>x</button>');
    $removeMessageButton.on('click', () => this.message.purgeSelf());
    return $removeMessageButton
  }

  renderConsentfulGestures = () => {
    const {votes} = this.message.messageData;
    
    const $consentfulGesturesTemplate = $(document.getElementById('consentfulGesturesTemplate').content.cloneNode(true));
    if (isPlainObject(votes)) {
      Object.keys(votes).forEach(option => {
        $consentfulGesturesTemplate.find(`.voteOption.${option} .voteCount`).text(votes[option]);
      });
    };

    $consentfulGesturesTemplate.find('.voteOption').each((_, option) => {
      $(option).on('click', (e) => {
        $(option).toggleClass('myVote');
        $('.voteOption').not(`.${$(option).data('value')}`).removeClass('myVote');
        this.message.castVote($(option).data('value'));
      });
    })
   
    return $consentfulGesturesTemplate;
  }

  renderCreatePollButton = () => {
    const {id} = this.message.messageData;
    const $makeVoteButton = $('<button class="makeVote"><i class="fas fa-check"></i></button>');

    $makeVoteButton.on('click', (e) => {
      this.message.createPoll();
      (e.target).closest('.makeVote').remove();
    });

    return $makeVoteButton;
  }

  renderMajorityRulesButtons = () => {
    const {votes} = this.message.messageData;
    
    const $majorityRulesTemplate = $(document.getElementById('majorityRulesTemplate').content.cloneNode(true));
    if (isPlainObject(votes)) {
      Object.keys(votes).forEach(option => {
        $majorityRulesTemplate.find(`.voteOption.${option} .voteCount`).text(votes[option]);
      });
    };

    $majorityRulesTemplate.find('.voteOption').each((_, option) => {
      $(option).on('click', (e) => {
        $(option).toggleClass('myVote');
        $('.voteOption').not(`.${$(option).data('value')}`).removeClass('myVote');
        this.message.castVote($(option).data('value'));
      });
    })
   
    return $majorityRulesTemplate;
  }

  renderConsentToArchiveButton = () => {
    const {id, archivalMessageId} = this.message.messageData;
    const $consentToArchiveButton = $('<button class="initConsentToArchiveProcess"><i class="fas fa-align-justify"></i></button>');
    if (archivalMessageId) {
      $consentToArchiveButton.addClass('checked');
      $consentToArchiveButton.on('click', (e) => {
        // revoke consent
      });
    } else {
      $consentToArchiveButton.on('click', (e) => {
        e.stopPropagation();
        this.message.initiateConsentToArchiveProcess();
      });
    }

    return $consentToArchiveButton;
  }
}

const ephemeralMessageRenderer = new EphemeralMessageRenderer();

export default ephemeralMessageRenderer;