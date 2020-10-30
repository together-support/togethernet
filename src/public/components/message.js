import store from '../store/store.js';

export const myTextRecord = (message) => {  
  return textRecord({
    messageIndex: store.get('messageIndex'),
    name: store.get('name'),
    avatar: store.get('avatar'),
    x: $('#user').position().left,
    y: $('#user').position().top,
    message
  });
}

export const textRecord = ({x, y, messageIndex, message, name, avatar}) => {
  const $textRecord = $(`<div class="textRecord" id="textRecord-${messageIndex}"></div>`)
  $textRecord.css({
    left: x,
    top: y,
    backgroundColor: avatar,
  });

  const $textBubble = $(`<div class="textBubble" id="textBubble-${messageIndex}"></div>`)

  const $name = $('<b></b>');
  $name.text(name);

  const $message = $('<p></p>');
  $message.text(message)

  $name.appendTo($textBubble);
  $message.appendTo($textBubble);
  $textBubble.appendTo($textRecord)
  
  return $textRecord;
}

export const tempBubble = (name, message) => {
  const $tempBubble = $(`<div class="textBubble" id="tempBubble-${store.get('messageIndex')}"></div>`);

  const $name = $('<b></b>');
  $name.text(name);

  const $message = $('<p></p>');
  $message.text(message)

  $name.appendTo($tempBubble);
  $message.appendTo($tempBubble);

  return $tempBubble;
}

export const systemBubble = (message) => {
  const $systemBubble = $(`<div class="systemBubble" id="systemBubble-${store.get('systemMessageIndex')}"></div>`);
  const $message = $('<p></p>');
  $message.text(message);

  $message.appendTo($systemBubble);
  return $systemBubble;
}