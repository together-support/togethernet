import store from '../store/store.js';
import {removeAllSystemMessage} from './systemMessage.js';
import {myTextRecord, textRecord, tempBubble} from '../components/message.js';


export const renderOutgoingEphemeralMessage = (message) => {
  removeAllSystemMessage();
  store.addMyActivePositions();
  store.increment('messageIndex');
  myTextRecord(message).appendTo($('#ephemeralSpace'));
  tempBubble(message).appendTo($('#user'));
}

export const renderIncomingEphemeralMessage = ({x, y, name, avatar, message}) => {
  textRecord({x, y, name, avatar, message}).appendTo($('#ephemeralSpace'));
  store.increment('messageIndex');
  store.addActivePositions({x, y});
}

const hidePrivateMsg = () => {
  // for (let i = 0; i < msgIndex; i++) {
  //   let tempBubble = document.getElementById(`temp-bubble-${i}`);
  //   if (Boolean(tempBubble)) {
  //     tempBubble.remove();
  //   }

  //   let textBubble = document.getElementById(`text-bubble-${i}`);
  //   if (Boolean(textBubble)) {
  //     $(textBubble).hide();
  //     $(`#text-record-${i}`)
  //       .mouseenter(() => $(textBubble).show())
  //       .mouseleave(() => $(textBubble).hide());
  //   }
  // }
}
