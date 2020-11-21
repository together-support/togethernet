import {removeMessage, hideAgendaForPeers} from '../js/ephemeralView.js';
import store from '../store/index.js';
import {roomModes} from '../constants/index.js'
import {createPoll, castVote} from '../js/voting.js';

export const disappearingTextRecord = (data) => {
  const $textRecord = textRecord(data);

  $textRecord
    .mouseenter(() => $textRecord.find('.textBubble').show())
    .mouseleave(() => $textRecord.find('.textBubble').hide())
    .on('adjacent', () => $textRecord.find('.textBubble').show());

  return $textRecord;
}

export const persistentTextRecord = (data) => {
  const $textRecord = textRecord(data);
  const $textBubble = $textRecord.find('.textBubble'); 
  const $textBubbleButtons = $textBubble.find('.textBubbleButtons');

  const {roomId, isPoll, votes} = data;
  const room = store.getRoom(roomId);

  const $hideButton = $('<button class="icon">-</button>');
  $hideButton.on('click', () => $textBubble.hide());
  $hideButton.prependTo($textBubbleButtons);

  if (room.mode === roomModes.facilitated) {
    if (isPoll) {
      $textBubble.addClass('poll');
      votingButtons('majorityRules', votes).appendTo($textBubble);
    } else {
      const $createPoll = $('<button id="makeVote">Vote</button>');
      $createPoll.on('click', createPoll);
      $createPoll.prependTo($textRecord.find('.textBubbleButtons'));  
    }
  }

  $textRecord.mouseenter(() => $textBubble.show());

  return $textRecord;
}

export const agendaTextRecord = (data) => {
  const $textRecord = textRecord(data);
  const $textBubble = $textRecord.find('.textBubble'); 
  const $textBubbleButtons = $textBubble.find('.textBubbleButtons');

  if (data.isMine) {
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

  return $textRecord;
}

const textRecord = ({x, y, message, messageType, name, avatar, isMine, roomId, votes}) => {
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

  const room = store.getRoom(roomId);
  if (room.mode === roomModes.directAction) {
    votingButtons('consentfulGestures', votes).appendTo($textBubble);
  }

  return $textRecord;
}

export const votingButtons = (template, votes) => {
  const $votingButtonsTemplate = $(document.getElementById(template).content.cloneNode(true));
  $votingButtonsTemplate.find('.votingButtons').children().each((_, el) => {
    const option = $(el).data('value');
    $(el).find('.voteCount').text(votes[option]);
    $(el).on('click', castVote);
  })

  return $votingButtonsTemplate;
}

export const systemBubble = (message) => {
  const $systemBubble = $(`<div class="systemBubble"></div>`);
  const $message = $('<p></p>');
  $message.text(message);

  $message.appendTo($systemBubble);
  return $systemBubble;
}
