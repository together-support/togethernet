// Exports node modules
const P2P = require("simple-peer");
const io = require("socket.io-client");
const p5 = require("p5");
const socket = io.connect(); // Manually opens the socket

const url = "http://localhost:3000";
const archive = "/archive";

// Simple Peer
let peer;
let peers = {};

// HTML elements
let messageDiv; // where all messages display
let messageInput; // text field to type message
let sendBtn; // button to send message

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
            addMessage(connectedMsg);

            // print your peer ID in the console
            console.log(`${connectedMsg}, your peer ID is ${socket.id}`);
        });

        socket.on("peer", function(data) {
            let peerId = data.peerId;

            // More API options here https://github.com/feross/simple-peer#peer--new-peeropts
            peer = new P2P({
                initiator: data.initiator,
                trickle: true
            });

            // System broadcast
            let newPeerMsg = `You're available one the signal server but you have not been paired`;
            addMessage(newPeerMsg);
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
                let errorMsg = `Error sending connection to peer: ${peerId}, ${e}`
                addMessage(errorMsg);
                console.log(errorMsg);
            });

            peer.on("connect", function() {
                // System broadcast
                let connectedPeerMsg = `Peer connection established. Say something.`;
                addMessage(connectedPeerMsg);
                console.log(`${connectedPeerMsg}`);
            });

            peer.on("data", function(data) {
                // converts received data from Unit8Array to string
                incomingMsg = data.toString();

                // insert msg into the chatroom
                addMessage(incomingMsg);

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
    messageDiv = document.querySelector("#_messageDiv"); // past messages go here
    messageInput = document.querySelector("#_messageInput"); // text input for message
    sendBtn = document.querySelector("#_sendBtn"); // send button

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

    publicSendBtn.addEventListener("click", sendPublicMsg);
    // -> for when "enter" is pressed in input field
    publicMsgInput.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            sendPublicMsg();
            return false;
        }
    });
}

function sendMessage() {
    // triggers when button or enter key is pressed

    // set text be value of input field
    outgoingMsg = messageInput.value;

    // Send text/binary data to the remote peer. https://github.com/feross/simple-peer#peersenddata
    peer.send(outgoingMsg);

    console.log(`sending message: ${outgoingMsg}`); // note: using template literal string: ${variable} inside backticks

    // insert msg into the chatroom
    addMessage(outgoingMsg);

    // clear input field
    messageInput.value = "";
}

function sendPublicMsg() {
    outgoingPublicMsg = publicMsgInput.value;
    let outgoingPublicJson = {
        msg: outgoingPublicMsg
    }
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
    console.log(`sending public msg: ${outgoingPublicMsg}`);
}

function addMessage(data) {
    let today = new Date();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    // add HTML to end of messageDiv
    // the message is wrapped in a div with class "message" so it can be styled in CSS
    messageDiv.insertAdjacentHTML(
        "beforeend",
        `<div class="message">
        <p>${time} ${data}</p>
    </div>`
    );
    // auto-scroll message container
    messageDiv.scrollTop = messageDiv.scrollHeight - messageDiv.clientHeight;
}