import {removeMessage} from '../js/sendEphemeralText.js';

export const myTextRecord = (data) => {  
  return textRecord({
    ...data,
    isMine: true,
  });
}

export const textRecord = ({x, y, message, name, avatar, isMine, roomId}) => {
  const $textRecord = $(`<div class="textRecord ephemeral" id="${roomId}-${x}-${y}"></div>`);
  $textRecord.css({left: x, top: y, backgroundColor: avatar});
  const $textBubble = $(`<div class="textBubble" id="textBubble-${roomId}-${x}-${y}"></div>`);

  if (isMine) {
    const $closeButton = $('<button>x</button>');
    $closeButton.on('click', removeMessage);
    $closeButton.appendTo($textBubble);
  }

  const $name = $('<b></b>');
  $name.text(name);

  const $message = $('<p></p>');
  $message.text(message)

  $name.appendTo($textBubble);
  $message.appendTo($textBubble);
  $textBubble.appendTo($textRecord)

  $textRecord
    .mouseenter(() => $textBubble.show())
    .mouseleave(() => $textBubble.hide())
    .on('adjacent', () => $textBubble.show());
  
  return $textRecord;
}

export const systemBubble = (message) => {
  const $systemBubble = $(`<div class="systemBubble"></div>`);
  const $message = $('<p></p>');
  $message.text(message);

  $message.appendTo($systemBubble);
  return $systemBubble;
}