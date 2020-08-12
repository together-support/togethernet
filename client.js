// Exports node modules
const Peer = require("simple-peer");
const io = require("socket.io-client");
const p5 = require("p5");
const socket = io.connect(); // Manually opens the socket
// const { makeConnectionList } = require('./connection');

// const url = "https://togethernet-p2p-template.herokuapp.com";
const url = "http://localhost:3000";
const archive = "/archive";
const { MessageTracker } = require('./lib/messagetracker');

// Simple Peer
let peer;
const peers = {};

// MessageTracker instance to handle read state of messages
const messageTracker = new MessageTracker();

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
          console.log('===============socket connect event=========================')
            // System broadcast
            let connectedMsg = `Searching for peers...`;
            addSystemMsg(connectedMsg);

            // print your peer ID in the console
            console.log(`${connectedMsg}, your peer ID is ${socket.id}`);
        });

      //toggles on receiving peer event from server
      //all simplePeer events happen once the socket has received the peer event
      //peer event instantiates P2P object and adds event listeners

      /*
       * chain of events:
       * 1. (client) connect to socketIO
       * 2. (server) registers socket id and look for other sockets to connect to
       * 3. (serv) emits 'peer' event to available sockets
       * 4. (cli) receives 'peer' ws event
       * 5. (cli) instantiates P2P as either initiator or receiver depending on data
       *
       * 6. (cli) runs "signal" event if initiating
       * 7. (serv) iterates over all available sockets and emits 'signal' with socket id
       * 8. (cli) emits peer.signal
       * 9. (cli) receives peer.signal
       * 10. (cli) triggers new P2P()
       *
       * client A outgoing WS: connect, signal, ping pong
       * client B outgoing WS: connect, signal, ping pong
       *
      */

      //this should already scope all of the event listeners to each peer, no?

        socket.on("peer", function(data) {
            console.log('===============socket peer event=========================')
            let peerId = data.peerId; //id of remote peer (provided by server)

            console.log('data.initiator', data.initiator);
            // opens up possibility for a connection/configuration
            const peer = new Peer({
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


            //maintain global list of peers
            peers[peerId] = peer;
            peer.on('close', ()=>{
              delete peers[peerId];
            })

            // System broadcast
            let newPeerMsg = `You're available on the signal server but you have not been paired`;
            console.log(`${newPeerMsg} Peer ID: ${peerId}`);

            //if initiator, fires signal immediately
            //if not, waits for remote signal
            peer.on("signal", function(data) {
              //when i have a signal ready, do the following
              console.log('===============peer signal event=========================')
              console.log('data is', data)
                // Fired when the peer wants to send signaling data to the remote peer
                console.log('sending socket signal')
                socket.emit("signal", {
                    signal: data,
                    peerId: peerId
                });
            });

            socket.on("signal", function(data) {
                console.log('===============socket signal event=========================')
                console.log('receiving data', data)
                if (data.peerId == peerId) {
                    console.log('sending peer signal')
                    peer.signal(data.signal);
                }
            });


            peer.on("error", function(e) {
                delete peers[peerId];
                let errorMsg = `Error connecting to peer. Please wait or refresh the page`
                addSystemMsg(errorMsg);
                console.log(`Error sending connection to peer: ${peerId}, ${e}`);
            });

            peer.on("connect", function() {
            console.log('===============peer connect event=========================')
                // System broadcast
                let connectedPeerMsg = `Peer connection established. You're now ready to chat in the p2p mode`;
                addSystemMsg(connectedPeerMsg);
                console.log(`${connectedPeerMsg}`);
            });

            peer.on("data", function(data) {
                // converts received data from Unit8Array to string
                incomingMsg = JSON.parse(data.toString());
                console.log(incomingMsg);

                if(incomingMsg.type === 'read'){
                  messageTracker.processReceipt(incomingMsg);
                  const messageState = messageTracker.getReceivedState(incomingMsg.id);
                  console.log('status of our message is', messageState);
                  if(messageState.missedRecipients.length === 0){
                    markRead(incomingMsg.id);
                  }
                }else{
                // insert msg into the chatroom
                  addPrivateMsg(incomingMsg.name, incomingMsg.body);
                  const receipt = messageTracker.createReceipt(incomingMsg);
                  peer.send(JSON.stringify(receipt))
                }
            });


            console.log('peers are', peers);
        });

        // SOCKET.IO + ARCHIVAL
        // Whenever the server emits 'new message', update the chat body
        socket.on('public message', (data) => {
          console.log('===============socket public message event=========================')
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
        let sentMessage = {}
        // send private message
        if ($('.privateMsg').is(':visible')){
            for (let [peerId, peer] of Object.entries(peers)){
              const outgoingMessage = {
                name,
                body: messageInput.value,
                id: privateMsgIndex,
                recipient: peerId
              }
              if ('send' in peer){
                messageTracker.addMessage(outgoingMessage);
                peer.send(JSON.stringify(outgoingMessage));
                sentMessage = outgoingMessage
              }
            }
            //add message to UI
            addPrivateMsg(sentMessage.name, sentMessage.body);
            markUnread(sentMessage.id);
        }
        // send public message
        if ($('.publicMsg').is(':visible')){
            socket.emit('public message', {
                name: name,
                outgoingMsg: outgoingMessage.body
            });
            archivePublicMsg(name, outgoingMsg);
            addPublicMsg(outgoingMessage.name, outgoingMessage.body);
        }
        // send private message
        console.log(`sending message: ${outgoingMsg}`); // note: using template literal string: ${variable} inside backticks
        // clear input field
        messageInput.value = "";
    } else {
        alert('your message is empty');
    }
}

//add/hide CSS class to items that are unread/read
function markRead(id){
  const messageDiv = document.getElementById(`message${id}`)
  messageDiv.classList.add("read");
  messageDiv.classList.remove("unread");
}
function markUnread(id){
  const messageDiv = document.getElementById(`message${id}`)
  messageDiv.classList.add("unread");
  messageDiv.classList.remove("read");
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

    privateMsgIndex++;


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
