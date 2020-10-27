import store from '../store/store.js';

export const myTextRecord = (message) => {  
  return textRecord({
    messageIndex: store.get('messageIndex'),
    name: store.get('name'),
    avatar: store.get('avatar'),
    ...store.get('position'),
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

  const $textBubble = $(`<div class="text-bubble" id="textBubble-${messageIndex}"></div>`)

  const $name = $('<b></b>');
  $name.text(name);

  const $message = $('<p></p>');
  $message.text(message)

  $name.appendTo($textBubble);
  $message.appendTo($textBubble);
  $textBubble.appendTo($textRecord)
  
  return $textRecord;
}

export const tempBubble = (name, msg) => {
  let tempBubble = document.createElement("div");
  tempBubble.setAttribute('id', `tempBlb-${msgIndex}`);
  tempBubble.classList.add(text-bubble);
  tempBubble.innerHTML = `<p><b>${name}</b></p><p>${msg}</p>`;

  return tempBubble;
}