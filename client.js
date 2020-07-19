const P2P = require("simple-peer");
const io = require("socket.io-client");
const p5 = require("p5");
const debug = require("debug")("client");
const socket = io.connect();
let peers = {};
const useTrickle = true;

// select HTML elements
let messageDiv = document.querySelector("#_messageDiv"); // past messages go here
let messageInput = document.querySelector("#_messageInput"); // text input for message
let sendBtn = document.querySelector("#_sendBtn"); // send button

let peer;

socket.on("connect", function() {
  // announce to the chatroom
  let connectedMsg = `Connected to signalling server`;
  addMessage(connectedMsg);

  // print your peer ID in the console
  console.log(`your peer ID is ${socket.id}`); //what's the difference beween socket.id and peerId?
});

socket.on("peer", function(data) {
  let peerId = data.peerId;
  peer = new P2P({ initiator: data.initiator, trickle: useTrickle });

  // announce to the chatroom
  let newPeerMsg = `You're ready to be discovered by other peers`;
  addMessage(newPeerMsg);
  console.log(`Peer ID: ${peerId}`);

  socket.on("signal", function(data) {
    if (data.peerId == peerId) {
      console.log("Received signalling data", data, "from Peer ID:", peerId);
      peer.signal(data.signal);
    }
  });

  peer.on("signal", function(data) {
    // console.log("Advertising signalling data", data, "to Peer ID:", peerId);
    socket.emit("signal", {
      signal: data,
      peerId: peerId
    });
  });

  peer.on("error", function(e) {
    console.log("Error sending connection to peer %s:", peerId, e);
  });

  peer.on("connect", function() {
    // announce to the chatroom
    let connectedPeerMsg = `Peer connection established`;
    addMessage(connectedPeerMsg);
    console.log("Peer connection established");
  });

  peer.on("data", function(data) {
    let incomingMsg = data.toString(); // converts data from Unit8Array to string

    // insert message to the chatroom
    addMessage(incomingMsg);

    console.log("Recieved data from peer:" + incomingMsg);
  });

  peers[peerId] = peer;

  // set events for sending message > trigger the sendMessage() function
  // -> for when button is blicked
  sendBtn.addEventListener("click", sendMessage);
  // -> for when "enter" is pressed in input field
  messageInput.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      sendMessage();
      return false;
    }
  });
});

function sendMessage() {
  // triggers when button or enter key is pressed

  // set text be value of input field
  let outgoingMsg = messageInput.value;

  // send the message to peer
  if (peer) {
    peer.send(outgoingMsg);
  } else {
    addMessage(`No peer has joined yet :-/`);
  }

  console.log(`sending message: ${outgoingMsg}`); // note: using template literal string: ${variable} inside backticks

  // insert message to the chatroom
  addMessage(outgoingMsg);

  // clear input field
  messageInput.value = "";

  // auto-scroll message container
  messageDiv.scrollTop = messageDiv.scrollHeight - messageDiv.clientHeight;
}

function addMessage(data) {
  // add HTML to end of messageDiv
  // the message is wrapped in a div with class "message" so it can be styled in CSS
  messageDiv.insertAdjacentHTML(
    "beforeend",
    `<div class="message">
        <p>${data}</p>
    </div>`
  );
}
