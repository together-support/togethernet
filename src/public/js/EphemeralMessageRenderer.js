import store from '@js/store';
import {roomModes} from '@js/constants';
import isPlainObject from 'lodash/isPlainObject';
import {
  addSystemConfirmMessage,
} from '@js/Togethernet/systemMessage';
import { systemConfirmMsgConfirmRevokeConsentToArchive } from '@js/constants.js';
export const renderEphemeralDetails = (roomId, messageId) => {
  const room = store.getRoom(roomId);
  const message = room.ephemeralHistory[messageId];

  const $ephemeralRecordDetails = $(
    document
      .getElementById('ephemeralRecordDetailsTemplate')
      .content.cloneNode(true)
  );
  const $messageDetails = $ephemeralRecordDetails.find(
    '.ephemeralRecordDetails'
  );

  if (!message) {
    $messageDetails.text('[message removed]');
  } else {
    const myId = store.getCurrentUser().socketId;
  
    const {id, name, content, socketId, canVote, archivedMessageId, inConsentToArchiveProcess, consentToArchiveRecords = {}} = message.messageData;
  
    $messageDetails.attr('id', `ephemeralDetails-${id}`);

    $messageDetails.find('.author').text(name);
    $messageDetails.find('.content').text(content);

    if (store.isMe(socketId)) {
      const $removeMessageButton = renderCloseButton(message);
      $removeMessageButton.appendTo($messageDetails.find('.messageActions'));
    }

    if (room.mode === roomModes.directAction) {
      const $consentfulGestures = renderConsentfulGestures(message);
      $consentfulGestures.appendTo(
        $messageDetails.find('.votingButtonsContainer')
      );
    }

    if (
      room.mode === roomModes.facilitated &&
      room.facilitators.includes(myId) &&
      !canVote
    ) {
      const $makeVoteButton = renderCreatePollButton(message);
      $makeVoteButton.appendTo($messageDetails.find('.messageActions'));
    }

    if (room.mode === roomModes.facilitated && canVote) {
      const $majorityRulesButtons = renderMajorityRulesButtons(message);
      $majorityRulesButtons.appendTo(
        $messageDetails.find('.votingButtonsContainer')
      );
    }
  
    if ((!archivedMessageId || Object.keys(consentToArchiveRecords).includes(store.getCurrentUser().socketId)) && !inConsentToArchiveProcess) {
      const $consentToArchiveButton = renderConsentToArchiveButton(message);
      $consentToArchiveButton.appendTo($messageDetails.find('.messageActions'));
    }
  }

  return $ephemeralRecordDetails;
};

const renderConsentToArchiveButton = (message) => {
  const { archivedMessageId, consentToArchiveRecords = {} } = message.messageData;
  const $consentToArchiveButton = $(
    '<button class="initConsentToArchiveProcess" title="consent to archive">☰</button>'
  );

  if (
    archivedMessageId &&
    Object.keys(consentToArchiveRecords).includes(
      store.getCurrentUser().socketId
    )
  ) {
    $consentToArchiveButton.addClass('checked');
    $consentToArchiveButton.on('click', () => {
      addSystemConfirmMessage(systemConfirmMsgConfirmRevokeConsentToArchive, message.messageData);
    });
  } else {
    $consentToArchiveButton.on('click', (e) => {
      e.stopPropagation();
      message.consentToArchiveButtonClicked();
    });
  }

  return $consentToArchiveButton;
};

const renderConsentfulGestures = (message) => {
  const {votes} = message.messageData;

  const $consentfulGesturesTemplate = $(
    document
      .getElementById('consentfulGesturesTemplate')
      .content.cloneNode(true)
  );
  if (isPlainObject(votes)) {
    Object.keys(votes).forEach((option) => {
      $consentfulGesturesTemplate
        .find(`.voteOption.${option} .voteCount`)
        .text(votes[option]);
    });
  }

  $consentfulGesturesTemplate.find('.voteOption').each((_, option) => {
    $(option).on('click', () => {
      $(option).toggleClass('myVote');
      $('.voteOption')
        .not(`.${$(option).data('value')}`)
        .removeClass('myVote');
      message.castVote($(option).data('value'));
    });
  });

  return $consentfulGesturesTemplate;
};

const renderCreatePollButton = (message) => {
  const $makeVoteButton = $(
    '<button class="makeVote">✓</button>'
  );

  $makeVoteButton.on('click', (e) => {
    message.createPoll();
    e.target.closest('.makeVote').remove();
  });

  return $makeVoteButton;
};

const renderMajorityRulesButtons = (message) => {
  const {votes} = message.messageData;

  const $majorityRulesTemplate = $(
    document.getElementById('majorityRulesTemplate').content.cloneNode(true)
  );
  if (isPlainObject(votes)) {
    Object.keys(votes).forEach((option) => {
      $majorityRulesTemplate
        .find(`.voteOption.${option} .voteCount`)
        .text(votes[option]);
    });
  }

  $majorityRulesTemplate.find('.voteOption').each((_, option) => {
    $(option).on('click', () => {
      $(option).toggleClass('myVote');
      $('.voteOption')
        .not(`.${$(option).data('value')}`)
        .removeClass('myVote');
      message.castVote($(option).data('value'));
    });
  });

  return $majorityRulesTemplate;
};

const renderCloseButton = (message) => {
  const $removeMessageButton = $('<button>✕</button>');
  $removeMessageButton.on('click', () => {
    message.purgeSelf();
  });
  return $removeMessageButton;
};
