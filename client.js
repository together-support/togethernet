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
const peers = {};


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

socket.test = socket.emit;
socket.emit = function(...args){
  console.log('outgoing ws message')
  console.log(args);
  return socket.test(...args);
}

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
      //todo: * encapsulate so that globals aren't an issue
      //      * broadcast data to all peers
      //      * what's causing errors on multiple peer connections?
      //      * is there a better way to do it? We don't really need to have a live connection to the server
      //      * well, maybe we do? otherwise, how do we know who dropped off of the connection?
      //
      //
 

      /*
       * chain of events:
       * 1. (client) connect to socketIO
       * 2. (server) registers socket id and look for other sockets to connect to
       * 3. (serv) emits 'peer' event to available sockets
       * 4. (cli) receives 'peer' ws event
       * 5. (cli) instantiates P2P as either initiator or receiver depending on data
       *
       * 6. (cli) somehow emits a ws signal????????
       * 7. (serv) iterates over all available sockets and emits 'signal' with socket id
       * 8. (cli) emits peer.signal
       * 9. (cli) receives peer.signal
       * 10. (cli) triggers new P2P()
       *
       * client A outgoing WS: connect, signal, ping pong
       * client B outgoing WS: connect, signal, ping pong
       *
       *
       * update: apparently event listeners are reversed;
       * webrtc waits for event to be prepped, then triggers
       * idk why tf they'd do it like this, but peer.on('signal') doesn't wait for
       * a remote signal, but rather waits for your signal to be prepped then does XYZ
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
                  //peer.signal(data.signal);
              //why does the socket have to emit a signal?
                socket.emit("signal", {
                    signal: data,
                    peerId: peerId
                });
            });

          //do i need to create another new peer here?
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
                incomingMsg = data.toString();

                // separate name and msg apart
                let splitMsg = incomingMsg.split(',');

                // insert msg into the chatroom
                addPrivateMsg(splitMsg[0], splitMsg[1]);
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

// fails on webrtc not open if > 2
// how do we ensure that webrtc is listening?
function sendMessage() {

    let name = 'Anonymous';

    if (nameInput.value != '') {
        name = nameInput.value;
    }

    if (messageInput.value != '') {
        outgoingMsg = messageInput.value;
        // send private message
        if ($('.privateMsg').is(':visible') == true && $('.publicMsg').is(':visible') == false) {
            console.log('about to send to peers. what are they?', peers)
            for (let peer of Object.values(peers)){
              if ('send' in peer){
                peer.send([name, outgoingMsg]);
              }
            }
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
            console.log('about to send to peers. what are they?', peers)
            for(let peer of Object.values(peers)){
              if ('send' in peer){
                peer.send([name, outgoingMsg]);
              }
            }
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
