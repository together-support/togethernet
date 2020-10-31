import store from '../store/store.js';

export const myTextRecord = ({message}) => {  
  return textRecord({
    name: $('#_nameInput').text(),
    avatar: $('#userProfile').val(),
    x: $('#user').position().left,
    y: $('#user').position().top,
    message,
    isMine: true,
    room: store.get('room'),
  });
}

export const textRecord = ({x, y, message, name, avatar, isMine, room}) => {
  const $textRecord = $(
    `<div 
      class="textRecord" 
      id="${room}-${x}-${y}"
    >
    </div>`
  )
  $textRecord.css({
    left: x,
    top: y,
    backgroundColor: avatar,
  });

  const $textBubble = $(`<div class="textBubble" id="textBubble-${room}-${x}-${y}"></div>`);

  if (isMine) {
    const $closeButton = $('<button>x</button>');
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
  const $systemBubble = $(`<div class="systemBubble" id="systemBubble-${store.get('systemMessageIndex')}"></div>`);
  const $message = $('<p></p>');
  $message.text(message);

  $message.appendTo($systemBubble);
  return $systemBubble;
}