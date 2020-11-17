import {removeMessage, hideAgendaForPeers} from '../js/ephemeralView.js';
import store from '../store/index.js';
import {roomModes} from '../constants/index.js'
import {createPoll, castVote} from '../js/majorityRule.js';

export const disappearingTextRecord = (data) => {
  const $textRecord = textRecord(data);
  const $textBubble = $textRecord.find('.textBubble');

  const {isMine, roomId, isPoll, votes} = data;
  const room = store.getRoom(roomId);
  const majorityRuleEnabled = room.mode === roomModes.facilitated && room.enableMajorityRule;

  if (isMine && majorityRuleEnabled && !isPoll) {
    const $createPoll = $('<button id="makeVote">Vote</button>');
    $createPoll.on('click', createPoll);
    $createPoll.prependTo($textRecord.find('.textBubbleButtons'));
  }

  if (majorityRuleEnabled && isPoll) {
    $textBubble.addClass('poll');
    voteButtons(votes).appendTo($textBubble);
  }

  $textRecord
    .mouseenter(() => $textRecord.find('.textBubble').show())
    .mouseleave(() => $textRecord.find('.textBubble').hide())
    .on('adjacent', () => $textRecord.find('.textBubble').show());

  return $textRecord;
}

export const voteButtons = (votes) => {
  const $voteButtonsContainer = $('<div class="votingButtons"></div>');
  Object.keys(votes).forEach(option => {
    const $optionButton = $(`<button class="voteOption" data-value="${option}">${option}<span class="voteCount">${votes[option]}</span></button>`);
    $optionButton.on('click', castVote);
    $optionButton.appendTo($voteButtonsContainer);
  });
  return $voteButtonsContainer;
}

export const persistentTextRecord = (data) => {
  const $textRecord = textRecord(data);
  const $textBubble = $textRecord.find('.textBubble'); 
  const $textBubbleButtons = $textBubble.find('.textBubbleButtons');

  const $hideButton = $('<button class="icon">-</button>');
  $hideButton.on('click', () => $textBubble.hide());
  $hideButton.prependTo($textBubbleButtons);

  $textRecord.mouseenter(() => $textBubble.show());

  const room = store.getRoom(data.roomId);
  if (room.mode === roomModes.directAction && room.enableConsentfulGestures) {
    consentfulGestures().prependTo($textBubbleButtons);
  }

  return $textRecord;
}

export const agendaTextRecord = (data) => {
  const $textRecord = textRecord(data);
  const $textBubble = $textRecord.find('.textBubble'); 
  const $textBubbleButtons = $textBubble.find('.textBubbleButtons');

  const {isMine, roomId} = data;

  if (isMine) {
    const $hideButton = $('<button class="icon">-</button>');
    $hideButton.on('click', () => {
      $textBubble.hide();
      hideAgendaForPeers({agendaId: $textRecord.attr('id'), shouldHide: true});
    });
    $hideButton.prependTo($textBubbleButtons);
    $textRecord.mouseenter(() => {
      if ($textBubble.is(':hidden')) {
        $textBubble.show();
        hideAgendaForPeers({agendaId: $textRecord.attr('id'), shouldHide: false});
      }
    });
  }

  const room = store.getRoom(roomId);
  if (room.mode === roomModes.directAction && room.enableConsentfulGestures) {
    consentfulGestures().prependTo($textBubbleButtons);
  }

  return $textRecord;
}

const consentfulGestures = () => {
  const $consentfulGesturesClone = $(document.getElementById('consentfulGesturesTemplate').content.cloneNode(true));
  return $consentfulGesturesClone;
}

const textRecord = ({x, y, message, messageType, name, avatar, isMine, roomId}) => {
  const $textRecord = $(`<div class="textRecord ephemeral" id="${roomId}-${x}-${y}"></div>`);
  $textRecord.css({left: x, top: y, backgroundColor: avatar});
  const $textBubble = $(`<div class="textBubble ${messageType}" id="textBubble-${roomId}-${x}-${y}"><div class="textBubbleButtons"></div></div>`);

  if (isMine) {
    const $closeButton = $('<button class="close icon">x</button>');
    $closeButton.on('click', removeMessage);
    $closeButton.appendTo($textBubble.find('.textBubbleButtons'));
  }

  const $name = $('<b></b>');
  $name.text(name);

  const $message = $('<p></p>');
  $message.text(message)

  $name.appendTo($textBubble);
  $message.appendTo($textBubble);
  $textBubble.appendTo($textRecord);

  return $textRecord;
}

export const systemBubble = (message) => {
  const $systemBubble = $(`<div class="systemBubble"></div>`);
  const $message = $('<p></p>');
  $message.text(message);

  $message.appendTo($systemBubble);
  return $systemBubble;
}
