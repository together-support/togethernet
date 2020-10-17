import {delayhidePrivateMsg} from './privateMessage.js'
import {getUserPos} from './ui.js'

export const sendPos = () => {
  // $(privateMsgToggle).keydown(function (evt) {
  //   evt = evt || window.event;
  //   setTimeout(function () {
  //     // hide system & private msg when a key is pressed
  //     removeSysMsg();
  // delayhidePrivateMsg();
  // const {userX, userY} = getUserPos();


  //     // console.log("local pos is : " + userX, userY);
  //     for (let peer of Object.values(peers)) {
  //       // keep in this order to accomodate unshift()
  //       if (peer && "send" in peer) {
  //         console.log("peer is", peer);
  //         peer.send(userY);
  //         peer.send(userX);
  //       }
  //     }

  //     // console.log(posArray.length, msgIndex + msgIndex);
  //     // check if avatar & user's text records are overlapped or adjacent
  //     for (let i = 0; i < posArray.length; i++) {
  //       let posX = posArray[i][0];
  //       let posY = posArray[i][1];
  //       if (userX == posX && userY == posY) {
  //         getConsent(evt);
  //         stopSendMsg = true;
  //       } else if (
  //         (posX == userX + cell && posY == userY) ||
  //         (posX == userX - cell && posY == userY) ||
  //         (posY == userY + cell && posX == userX) ||
  //         (posY == userY - cell && posX == userX)
  //       ) {
  //         replyThread(evt, i);
  //         stopSendMsg = false;
  //       } else {
  //         // allow user to send new msg
  //         stopSendMsg = false;
  //       }
  //     }
  //   }, 0);
  // });
}
