import {getUserPos} from './ui.js';

export const peer = () => {
//   peer = document.createElement("div");
//   privatePeerIndex += 1;
//   peer.setAttribute(`id`, `peer${privatePeerIndex}`);
//   peer.setAttribute(`class`, `square`);
//   // generate a random user color
//   peerColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
//   peer.style.backgroundColor = peerColor;
//   privateChatBox.appendChild(peer);

//   peerPos = $(`#peer${privatePeerIndex}`).position();
//   peerX = peerPos.left;
//   peerY = peerPos.top;
}

export const user = () => {
  //   user = document.getElementById("user");
  //   userProfile = document.getElementById("userProfile");
  
  //   // get user initial position
  const {userX, userY} = getUserPos();
  
  //   // generate a random user color
  //   userColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  //   // then assign randomized color to user and userProfile
  //   user.style.backgroundColor = userColor;
  //   userProfile.value = userColor;
  
  //   // listens to changes in the color picker to change user and userProfile colors
  //   userProfile.addEventListener("change", function () {
  //     userColor = userProfile.value;
  //     document.getElementById("user").style.backgroundColor = userColor;
  //     console.log("changed color" + userProfile.value);
  //   });
};