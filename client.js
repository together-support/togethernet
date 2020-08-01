// Exports node modules
const P2P = require("simple-peer");
const io = require("socket.io-client");
const p5 = require("p5");
const socket = io.connect(); // Manually opens the socket

const url = "https://togethernet-p2p-template.herokuapp.com";
const archive = "/archive";

// Simple Peer
let peer;
let peers = {};

// HTML elements
let name = 'anonymous';
let privateMsg;
let publicMsg;
let messageInput; // text field to type message
let sendBtn; // button to send message

let publicMsgIndex = 0;
let privateMsgIndex = 0;

let incomingMsg;
let outgoingMsg;
let outgoingPublicMsg;
let incomingPublicMsg;

// P5.JS
module.exports = new p5(function() {
    this.setup = function setup() {
        console.log("p5 is working");
        messageUI();

        // SOCKET.IO + SIMPLE PEER
        // Connects to the Node signaling server
        socket.on("connect", function() {
            // System broadcast
            let connectedMsg = `Connected to the signalling server`;
            addPrivateMsg(connectedMsg);

            // print your peer ID in the console
            console.log(`${connectedMsg}, your peer ID is ${socket.id}`);
        });

        socket.on("peer", function(data) {
            let peerId = data.peerId;

            // More API options here https://github.com/feross/simple-peer#peer--new-peeropts
            peer = new P2P({
                initiator: data.initiator,
                // reconnectTimer: 3000,
                // iceTransportPolicy: 'relay',
                trickle: false
                    // config: {
                    //     iceServers: [{
                    //             urls: "stun:numb.viagenie.ca",
                    //             username: "xinfilm@gmail.com",
                    //             credential: "BerlinSpain"
                    //         },
                    //         {
                    //             urls: "turn:numb.viagenie.ca",
                    //             username: "xinfilm@gmail.com",
                    //             credential: "BerlinSpain"
                    //         }
                    //     ]
                    // }
            });

            // System broadcast
            let newPeerMsg = `You're available one the signal server but you have not been paired`;
            addPrivateMsg(newPeerMsg);
            console.log(`${newPeerMsg} Peer ID: ${peerId}`);

            socket.on("signal", function(data) {
                if (data.peerId == peerId) {
                    console.log(
                        "Received signalling data",
                        data,
                        "from Peer ID:",
                        peerId
                    );
                    peer.signal(data.signal);
                }
            });

            peer.on("signal", function(data) {
                // Fired when the peer wants to send signaling data to the remote peer
                socket.emit("signal", {
                    signal: data,
                    peerId: peerId
                });
            });

            peer.on("error", function(e) {
                let errorMsg = `Oops, something went wrong. Try refreshing the page.`
                addPrivateMsg(errorMsg);
                console.log(`Error sending connection to peer: ${peerId}, ${e}`);
            });

            peer.on("connect", function() {
                // System broadcast
                let connectedPeerMsg = `Peer connection established. Say something.`;
                addPrivateMsg(connectedPeerMsg);
                console.log(`${connectedPeerMsg}`);
            });

            peer.on("data", function(data) {
                // converts received data from Unit8Array to string
                incomingMsg = data.toString();

                // insert msg into the chatroom
                addPrivateMsg(incomingMsg);

                console.log(`Recieved data from peer: ${incomingMsg}`);
            });

            peers[peerId] = peer;

            console.log(peers);
        });
    };
    this.draw = function draw() {};
});

function messageUI() {
    // private msg HTML elements
    privateMsg = document.querySelector("#_privateMsg"); // past messages go here
    publicMsg = document.querySelector("#_publicMsg"); // public messages go here
    messageInput = document.querySelector("#_messageInput"); // text input for message
    sendBtn = document.querySelector("#_sendBtn"); // send button
    nameInput = document.querySelector("#_nameInput");

    // public msg HTML elements
    publicMsgInput = document.querySelector("#_publicMsgInput"); // text input for message
    publicSendBtn = document.querySelector("#_publicSendBtn"); // send button

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
}

function sendMessage() {

    if (nameInput.value != '') {
        name = nameInput.value;
    }

    if (messageInput.value != '') {
        outgoingMsg = `${name}: ${messageInput.value}`;
        // send private message
        if ($('.privateMsg').is(':visible') == true && $('.publicMsg').is(':visible') == false) {
            // Send text/binary data to the remote peer. https://github.com/feross/simple-peer#peersenddata
            peer.send(outgoingMsg);
            addPrivateMsg(outgoingMsg);
        }
        // send public message
        else if ($('.publicMsg').is(':visible') == true && $('.privateMsg').is(':visible') == false) {
            addPublicMsg(outgoingMsg);
        }
        // send private message
        else if ($('.publicMsg').is(':visible') == true && $('.privateMsg').is(':visible') == true) {
            peer.send(outgoingMsg);
            addPrivateMsg(outgoingMsg);
        }
        console.log(`sending message: ${outgoingMsg}`); // note: using template literal string: ${variable} inside backticks
        // clear input field
        messageInput.value = "";
    } else {
        alert('your message is empty');
    }
}

function addPrivateMsg(data) {

    let today = new Date();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    // add HTML to end of privateMsg
    // the message is wrapped in a div with class "message" so it can be styled in CSS
    privateMsg.insertAdjacentHTML(
        "beforeend",
        `<div class="message">
      <p>${time} ${data}</p>
  </div>`
    );
    // auto-scroll message container
    privateMsg.scrollTop = privateMsg.scrollHeight - privateMsg.clientHeight;
}

function addPublicMsg(outgoingPublicMsg) {

    let outgoingPublicJson = {
        author: name,
        msg: outgoingPublicMsg
    }

    // send msg to archive/
    fetch(url + archive, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(outgoingPublicJson)
    }).then((res) => {
        return res.text();
    }).then((data) => {
        console.log(data);
    }); // posting url, object, 

    let today = new Date();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    publicMsgIndex++;

    // add HTML to end of privateMsg
    // the message is wrapped in a div with class "message" so it can be styled in CSS
    publicMsg.insertAdjacentHTML(
        "beforeend",
        `<div id="message${publicMsgIndex}">
      <p>${time} ${outgoingPublicMsg}</p>
  </div>`
    );

    console.log(publicMsgIndex);
    // auto-scroll message container
    publicMsg.scrollTop = publicMsg.scrollHeight - publicMsg.clientHeight;
}

// function sendPrivateMsg() {
//     // set text be value of input field
//     outgoingMsg = messageInput.value;

//     // Send text/binary data to the remote peer. https://github.com/feross/simple-peer#peersenddata
//     peer.send(outgoingMsg);

//     console.log(`sending message: ${outgoingMsg}`); // note: using template literal string: ${variable} inside backticks

//     // insert msg into the chatroom
//     addMessage(outgoingMsg);

//     // clear input field
//     messageInput.value = "";
// }

// function sendPublicMsg() {
//     outgoingPublicMsg = publicMsgInput.value;
//     let outgoingPublicJson = {
//         author: name,
//         msg: outgoingPublicMsg
//     }

//     // send msg to archive/
//     fetch(url + archive, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(outgoingPublicJson)
//     }).then((res) => {
//         return res.text();
//     }).then((data) => {
//         console.log(data);
//     }); // posting url, object, 

//     // insert msg into the chatroom
//     addMessage(outgoingPublicMsg);

//     // clear input field
//     publicMsgInput.value = "";
// }

// function addMessage(data) {
//     let today = new Date();
//     let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

//     // add HTML to end of privateMsg
//     // the message is wrapped in a div with class "message" so it can be styled in CSS
//     privateMsg.insertAdjacentHTML(
//         "beforeend",
//         `<div class="message">
//         <p>${time} ${data}</p>
//     </div>`
//     );
//     // auto-scroll message container
//     privateMsg.scrollTop = privateMsg.scrollHeight - privateMsg.clientHeight;
// }