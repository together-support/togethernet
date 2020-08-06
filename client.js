// Exports node modules
const Peer = require("simple-peer");
const io = require("socket.io-client");
const p5 = require("p5");
const socket = io.connect(); // Manually opens the socket
// const { makeConnectionList } = require('./connection');

// const url = "https://togethernet-p2p-template.herokuapp.com";
const url = "http://localhost:3000";
const archive = "/archive";

// Simple Peer
let peer;
let peers = [];
// let peers = {};
let peerArray = [];

// HTML elements
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
            let connectedMsg = `Searching for peers...`;
            addSystemMsg(connectedMsg);

            // print your peer ID in the console
            console.log(`${connectedMsg}, your peer ID is ${socket.id}`);
        });

        socket.on("peer", function(data) {

            let peerId = data.peerId;

            // console.log(data.peerId, data.initiator);

            peer = new Peer({
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

            console.log(peer);

            // // System broadcast
            // let newPeerMsg = `You're available on the signal server but you have not been paired`;
            // console.log(`${newPeerMsg} Peer ID: ${data.peerId}`);

            // socket.on("signal", function(data) {
            //     if (data.peerId == peerId) {
            //         console.log(
            //             "Received signalling data",
            //             data,
            //             "from Peer ID:",
            //             peerId
            //         );
            //         peer.signal(data.signal);
            //     }
            // });

            // peer.on("signal", function(data) {
            //     // Fired when the peer wants to send signaling data to the remote peer
            //     socket.emit("signal", {
            //         signal: data,
            //         peerId: peerId
            //     });
            // });

            // peer.on("error", function(e) {
            //     let errorMsg = `Something went wrong. Try refreshing the page`
            //     addSystemMsg(errorMsg);
            //     console.log(`Error sending connection to peer: ${peerId}, ${e}`);
            // });

            // peer.on("connect", function() {
            //     // System broadcast
            //     let connectedPeerMsg = `Peer connection established. You're now ready to chat in the p2p mode`;
            //     addSystemMsg(connectedPeerMsg);
            //     console.log(`${connectedPeerMsg}`);
            // });

            // peer.on("data", function(data) {
            //     // converts received data from Unit8Array to string
            //     incomingMsg = data.toString();

            //     // separate name and msg apart
            //     let splitMsg = incomingMsg.split(',');

            //     // insert msg into the chatroom
            //     addPrivateMsg(splitMsg[0], splitMsg[1]);
            // });

            // peers[peerId] = peer;

            // console.log(peers);
        });

        // SOCKET.IO + ARCHIVAL
        // Whenever the server emits 'new message', update the chat body
        socket.on('public message', (data) => {
            const clientName = data.name;
            incomingPublicMsg = data.msg;
            addPublicMsg(clientName, incomingPublicMsg);
        });
    };
    this.draw = function draw() {};
});

function messageUI() {
    // private msg HTML elements
    privateMsg = document.querySelector("#_privateMsg"); // private messages go here
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

    let name = 'Anonymous';

    if (nameInput.value != '') {
        name = nameInput.value;
    }

    if (messageInput.value != '') {
        outgoingMsg = messageInput.value;
        // send private message
        if ($('.privateMsg').is(':visible') == true && $('.publicMsg').is(':visible') == false) {
            peer.send([name, outgoingMsg]);
            addPrivateMsg(name, outgoingMsg);
        }
        // send public message
        else if ($('.publicMsg').is(':visible') == true && $('.privateMsg').is(':visible') == false) {
            socket.emit('public message', {
                name: name,
                outgoingMsg: outgoingMsg
            });
            archivePublicMsg(name, outgoingMsg);
            addPublicMsg(name, outgoingMsg);
        }
        // send private message
        else if ($('.publicMsg').is(':visible') == true && $('.privateMsg').is(':visible') == true) {
            peer.send([name, outgoingMsg]);
            addPrivateMsg(name, outgoingMsg);
        }
        console.log(`sending message: ${outgoingMsg}`); // note: using template literal string: ${variable} inside backticks
        // clear input field
        messageInput.value = "";
    } else {
        alert('your message is empty');
    }
}

function addSystemMsg(systemMsg) {
    privateMsg.insertAdjacentHTML(
        "beforeend",
        `<div class="message" id="systemMsg">
        <p>${systemMsg}</p>
        </div>`
    );
    // auto-scroll message container
    privateMsg.scrollTop = privateMsg.scrollHeight - privateMsg.clientHeight;
}

function addPrivateMsg(name, outgoingMsg) {

    let today = new Date();
    let time = today.getHours() + ":" + today.getMinutes();

    privateMsgIndex++;

    privateMsg.insertAdjacentHTML(
        "beforeend",
        `<div class="row">
        <div id="_privateName">
        <p>${name}</p>
        </div>
        <div id="_privateStamp">
        <p>${time}</p>
        </div>
        </div>
        <div class="message" id="message${privateMsgIndex}">
        <p>${outgoingMsg}</p>
        </div>`
    );
    // auto-scroll message container
    privateMsg.scrollTop = privateMsg.scrollHeight - privateMsg.clientHeight;

    // if user is in the other chat mode, send notification
    if ($('.publicMsg').is(':visible') == true && $('.privateMsg').is(':visible') == false) {
        $('#_privacyToggle').css('border', '1px solid red');
    } else {
        $('#_privacyToggle').css('border', '1px solid black');
    }

    // let askingConsent = {
    //     privateMsgIndex = i,
    //     notification = true
    // }
    for (let i = 0; i < privateMsgIndex; i++) {
        $(`#message${i}`).click(function() {
            $(`#message${i}`).slideUp();
            peer.send(askingConsent); // install Buffer to send more comlex data
            console.log(`#message${i} has been clicked`);
        });
    }
}

function archivePublicMsg(name, outgoingMsg) {

    let outgoingPublicJson = {
        name: name,
        msg: outgoingMsg
    }

    console.log(outgoingPublicJson);

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
}

function addPublicMsg(name, outgoingMsg) {
    let today = new Date();
    let time = today.getHours() + ":" + today.getMinutes();

    publicMsgIndex++;

    // add HTML to end of privateMsg
    // the message is wrapped in a div with class "message" so it can be styled in CSS
    publicMsg.insertAdjacentHTML(
        "beforeend",
        `<div class="row">
        <div id="_privateName">
        <p>${name}</p>
        </div>
        <div id="_privateStamp">
        <p>${time}</p>
        </div>
        </div>
        <div class="message" id="message${publicMsgIndex}">
        <p>${outgoingMsg}</p>
        </div>`
    );

    // auto-scroll message container
    publicMsg.scrollTop = publicMsg.scrollHeight - publicMsg.clientHeight;

    // if user is in the other chat mode, send notification
    if ($('.publicMsg').is(':visible') == false && $('.privateMsg').is(':visible') == true) {
        $('#_privacyToggle').css('border', '1px solid red');
    } else {
        $('#_privacyToggle').css('border', '1px solid black');
    }
}