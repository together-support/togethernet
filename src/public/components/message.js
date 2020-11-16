import {removeMessage} from '../js/ephemeralView.js';

export const myDisappearingTextRecord = (data) => {
  return disappearingTextRecord({
    ...data,
    isMine: true,
  });
}

export const myPersistentTextRecord = (data) => {
  return persistentTextRecord({
    ...data,
    isMine: true,
  });
}

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

  const $hideButton = $('<button>-</button>');
  $hideButton.on('click', () => $textRecord.find('.textBubble').hide());
  $hideButton.prependTo($textRecord.find('.textBubbleButtons'));

  $textRecord.mouseenter(() => $textRecord.find('.textBubble').show())

  return $textRecord;
}

const textRecord = ({x, y, message, messageType, name, avatar, isMine, roomId}) => {
  const $textRecord = $(`<div class="textRecord ephemeral" id="${roomId}-${x}-${y}"></div>`);
  $textRecord.css({left: x, top: y, backgroundColor: avatar});
  const $textBubble = $(`<div class="textBubble ${messageType}" id="textBubble-${roomId}-${x}-${y}"><div class="textBubbleButtons"></div></div>`);

  if (isMine) {
    const $closeButton = $('<button>x</button>');
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
