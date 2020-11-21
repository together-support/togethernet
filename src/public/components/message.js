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
  const $textRecordClone = $(document.getElementById('textRecordTemplate').content.cloneNode(true));
  
  const $textRecord = $textRecordClone.find('.textRecord');
  $textRecord.attr('id', `${roomId}-${x}-${y}`);
  $textRecord.css({left: x, top: y, backgroundColor: avatar});

  const $textBubble = $textRecord.find('.textBubble');
  $textBubble.addClass(messageType);
  $textBubble.attr('id', `textBubble-${roomId}-${x}-${y}`);

  if (isMine) {
    const $closeButton = $('<button class="close icon">x</button>');
    $closeButton.on('click', removeMessage);
    $closeButton.appendTo($textBubble.find('.textBubbleButtons'));
  }

  $textBubble.find('.name').text(name);
  $textBubble.find('.content').text(message);

  const room = store.getRoom(roomId);
  if (room.mode === roomModes.directAction) {
    votingButtons('consentfulGestures', votes).appendTo($textBubble);
  }

  return $textRecord;
}

export const votingButtons = (template, votes) => {
  const $votingButtons = $(document.getElementById(`${template}Template`).content.cloneNode(true));
  $votingButtons.find('.votingButtons').children().each((_, el) => {
    const option = $(el).data('value');
    $(el).find('.voteCount').text(votes[option]);
    $(el).on('click', castVote);
  })

  return $votingButtons;
}

export const systemBubble = (message) => {
  const $systemBubble = $(document.getElementById(`systemBubbleTemplate`).content.cloneNode(true));
  $systemBubble.find('p').text(message);
  return $systemBubble;
}
