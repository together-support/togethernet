export const sendMessageOnEnter = (event) => {
  if (event.keyCode === 13) {
    console.log('hello')
    // event.preventDefault();
    // sendMessage();
  }
}

export const sendMessage = (event) => {
//   if (!stopSendMsg && messageInput.value != "") {
//     outgoingMsg = messageInput.value;
//     // send private message
//     if (isPrivateVisible) {
//       console.log("about to send to peers. what are they?", peers);
//       for (let peer of Object.values(peers)) {
//         if (peer && "send" in peer) {
//           // keep it in this order to accomodate unshift()
//           peer.send(outgoingMsg);
//           peer.send(name);
//         }
//       }
//       outgoingPrivateMsg(name, outgoingMsg);
//     }
//     // send public message
//     else if (!isPrivateVisible) {
//       socket.emit("public message", {
//         name: name,
//         outgoingMsg: outgoingMsg,
//       });
//       archivePublicMsg(name, outgoingMsg);
//       addPublicMsg(name, outgoingMsg);
//     }
//     console.log(`sending message: ${outgoingMsg}`); // note: using template literal string: ${variable} inside backticks
//     // clear input field
//     messageInput.value = "";
//   } else if (stopSendMsg) {
//     alert("move to an empty spot to write the msg");
//   } else if (messageInput.value == "") {
//     alert("your message is empty");
//   }
}
