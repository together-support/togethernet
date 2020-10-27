import {incrementMessageIndex, addActivePositions, addMyActivePositions} from '../store/actions.js';
import {removeAllSystemMessage} from './systemMessage.js';
import {myTextRecord, textRecord} from '../components/messageRecord.js';


export const renderOutgoingEphemeralMessage = (message) => {
  removeAllSystemMessage();
  addMyActivePositions();
  incrementMessageIndex();
  myTextRecord(message).appendTo($('#ephemeralSpace'));
}

export const renderIncomingEphemeralMessage = ({sender, message}) => {
  textRecord({...sender, message}).appendTo($('#ephemeralSpace'));
  incrementMessageIndex();
  addActivePositions({x: sender.x, y: sender.y});
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
