import store from '../store/store.js';

export const myTextRecord = ({message}) => {  
  return textRecord({
    messageIndex: store.get('messageIndex'),
    name: $('#_nameInput').text(),
    avatar: $('#userProfile').val(),
    x: $('#user').position().left,
    y: $('#user').position().top,
    message
  });
}

export const textRecord = ({x, y, messageIndex, message, name, avatar}) => {
  const $textRecord = $(
    `<div 
      class="textRecord" 
      id="textRecord-${messageIndex}"
      data-position="${x}-${y}"
    >
    </div>`
  )
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

  $textRecord
    .mouseenter(() => $textBubble.show())
    .mouseleave(() => $textBubble.hide())
    .on('adjacent', () => $textBubble.show());
  
  return $textRecord;
}

export const tempBubble = ({name, message}) => {
  const $tempBubble = $(`<div class="tempBubble textBubble" id="tempBubble-${store.get('messageIndex')}"></div>`);

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