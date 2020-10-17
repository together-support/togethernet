// // Simple Peer
// let user;
// let userX, userY;
// let name = "Anonymous";
// let peer;
// let peerPos, peerX, peerY;
// const peers = {};
// let dataArray = [];
// let cell = 50; // cell size
// let userColor, peerColor;
// let userPosArray = [];
// let peerPosArray = [];
// let posArray = []; // userPosArray + peerPosArray

import {getUserPos} from './ui.js'

export const onSimplePeerSignal = (data) => {
  // console.log("client: ===============peer signal event=========================", data);
  // console.log("sending socket signal");

  // socket.emit("signal", {
  //   signal: data,
  //   peerId: peerId,
  // });
}


export const onSimplePeerError = (error) => {
  // console.log("client: ===============peer signal event=========================", data);
 
  // delete peers[peerId];
  // peer.destroy();
  // let errorMsg = `Error connecting to peer. Please wait or refresh the page`;
  // addSystemMsg(errorMsg);
  // console.log(`Error sending connection to peer: ${peerId}, ${e}`);
}

export const onSimplePeerData = (data) => {
  // console.log("receiving data", typeof data);

  // // received audio clips from peer
  // if (typeof data === "object") {
  //   const blob = new Blob([data]);
  //   incomingAudioMsg(blob);
  // } else {
  //   dataArray.unshift(data);
  //   // received x, y movements from peer
  //   if (
  //     Number(dataArray[0]) == dataArray[0] &&
  //     Number(dataArray[1]) == dataArray[1]
  //   ) {
  //     console.log("incoming data are numbers");
  //     let moveX = Number(dataArray[0]);
  //     let moveY = Number(dataArray[1]);
  //     updateRemotePeer(moveX, moveY);
  //     // reset data array
  //     dataArray = [];
  //   } else if (dataArray[0] != null && dataArray[1] != null) {
  //     if (
  //       Number(dataArray[0]) != dataArray[0] &&
  //       Number(dataArray[1]) != dataArray[1]
  //     ) {
  //       console.log(
  //         `incoming ${dataArray[0]} ${dataArray[1]} is not a number`
  //       );
  //       incomingPrivateMsg(dataArray[0], dataArray[1]);
  //       // reset data array
  //       dataArray = [];
  //     }
  //   }
  // }
}

export const onSimplePeerStream = (stream) => {
  // console.log("receiving stream!!!");

  // audio = document.getElementById(`audio${audioIndex}`);
  // audio.src = URL.createObjectURL(stream);
}

export const onSimplePeerConnect = () => {
  // console.log(
  //   "===============peer connect event========================="
  // );
  // // System broadcast
  // let connectedPeerMsg = `Peer connection established. You're now ready to chat in the p2p mode`;
  // addSystemMsg(connectedPeerMsg);
  // console.log(`${connectedPeerMsg}`);
  // console.log(peers, peerId);
}

// // update the positions of remote peers
const updateRemotePeer = (currentX, currentY) => {
//   $(() => {
//     $(`#peer${privatePeerIndex}`)
//       .finish()
//       .offset({
//         left: `${currentX}`,
//         top: `${currentY}`,
//       });

//     // get the latest user x y and peer x y
// const {userX, userY} = getUserPos();
//     peerX = currentX;
//     peerY = currentY;
//   });
}