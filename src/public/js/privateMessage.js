import {isPrivateVisible} from './utils.js';
import {getUserPos} from './ui.js';
import {tempBubble} from '../components/messageRecord.js';

// let privateChatBox;
// let privateMsg;
// let messageIndex;
export const delayhidePrivateMsg = () => {
  setTimeout(hidePrivateMsg, 0);
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

export const incomingPrivateMsg = (name, message) => {
  // peer.appendChild(tempBubble(name, message))
//   // add txt record
//   $(`#text-record-${msgIndex}`).css({
//     left: `${peerX}px`,
//     top: `${peerY}px`,
//     backgroundColor: `${peerColor}`,
//   });

    // const record = textRecord(peerX, peerY, peerColor, msgIndex)
    // privateChatBox.appendChild(record);
    // record.appendChild(textBubble(name, message))

    //   peerPosArray.push([peerX, peerY]);
//   posArray.push([peerX, peerY]);
//   // add 1 to msgIndex
//   msgIndex++;
}

export const outgoingPrivateMsg = (name, message) => {
  // removeSysMsg();
  // user.appendChild(tempBubble(name, message))
  // const {userX, userY} = getUserPos();
  // privateChatBox.appendChild(textRecord(userX, userY, userColor, msgIndex));

  // userPosArray.push([userX, userY]);
  // posArray.push([userX, userY]);
  // // add 1 to msgIndex
  // msgIndex++;
  // if (isPrivateVisible) {
  //   $("#_privacyToggle").addClass('is-private');
  // } else {
  //   $("#_privacyToggle").removeClass('is-private');
  // }
}