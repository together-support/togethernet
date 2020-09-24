// Exports node modules
const Peer = require("simple-peer");
const io = require("socket.io-client");
const p5 = require("p5");
const ui = require("./ui");
const socket = io.connect(); // Manually opens the socket

const FileType = require("file-type");
const { update } = require("lodash");

// const test = require("./test");
// console.log(`User: ${test.getName()}`);

// const url = "https://togethernet-p2p-template.herokuapp.com";
const url = "http://localhost:3000";
const archive = "/archive";
const record = "/record";

// Simple Peer
let user;
let userPos, userX, userY;
let randomColor;
let peer;
let peerPos, peerX, peerY;
const peers = {};
let dataArray = [];
let cell = 50;

// HTML elements
let privateChatBox;
let privateMsg;
let publicMsg;
let messageInput; // text field to type message
let sendBtn; // button to send message
let historyBtn; // button to open history menu

let publicMsgIndex = 0;
let incomingMsgIndex = 0;
let outgoingMsgIndex = 0;
let privatePeerIndex = 0;
let sysMsgIndex = 0;

let incomingMsg;
let outgoingMsg;
let outgoingPublicMsg;
let incomingPublicMsg;
let historyMsg;

socket.test = socket.emit;
socket.emit = function (...args) {
  console.log("outgoing ws message");
  console.log(args);
  return socket.test(...args);
};
// audio recording code
const audioPlayer = document.getElementById("audioPlayer");
const recordButton = document.getElementById("recordButton");
const stopRecordButton = document.getElementById("stopRecordButton");
const sendButton = document.getElementById("sendBlob");
let recording;
let blob;
let [stopped, shouldStop] = [false, false];

// P5.JS
module.exports = new p5(function () {
  this.setup = function setup() {
    console.log("p5 is working");
    messageUI();
    userUI();
    loadHistory();

    // SOCKET.IO + SIMPLE PEER
    // Connects to the Node signaling server
    socket.on("connect", function () {
      console.log(
        "===============socket connect event========================="
      );
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

    socket.on("peer", function (data) {
      console.log("===============socket peer event=========================");
      let peerId = data.peerId; //id of remote peer (provided by server)

      console.log("data.initiator", data.initiator);
      // opens up possibility for a connection/configuration
      const peer = new Peer({
        objectMode: true,
        initiator: data.initiator,
        // reconnectTimer: 3000,
        // iceTransportPolicy: 'relay',
        trickle: false,
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
      /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    peer.on('close', ()=>{
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      delete peers[peerId];
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    */
      // System broadcast
      let newPeerMsg = `You're available on the signal server but you have not been paired`;
      console.log(`${newPeerMsg} Peer ID: ${peerId}`);

      //if initiator, fires signal immediately
      //if not, waits for remote signal
      peer.on("signal", function (data) {
        //when i have a signal ready, do the following
        console.log(
          "===============peer signal event========================="
        );
        console.log("data is", data);
        // Fired when the peer wants to send signaling data to the remote peer
        console.log("sending socket signal");
        //peer.signal(data.signal);
        //why does the socket have to emit a signal?
        socket.emit("signal", {
          signal: data,
          peerId: peerId,
        });
      });

      //do i need to create another new peer here?
      socket.on("signal", function (data) {
        console.log(
          "===============socket signal event========================="
        );
        console.log("receiving data", data);
        if (data.peerId == peerId) {
          console.log("sending peer signal");
          peer.signal(data.signal);
        }
      });

      peer.on("error", function (e) {
        console.log("===============peer error event=========================");
        delete peers[peerId];
        let errorMsg = `Error connecting to peer. Please wait or refresh the page`;
        addSystemMsg(errorMsg);
        console.log(`Error sending connection to peer: ${peerId}, ${e}`);
      });

      peer.on("connect", function () {
        console.log(
          "===============peer connect event========================="
        );
        // System broadcast
        let connectedPeerMsg = `Peer connection established. You're now ready to chat in the p2p mode`;
        addSystemMsg(connectedPeerMsg);
        console.log(`${connectedPeerMsg}`);
        // Create peer UI
        peerUI();
      });
      peer.on("stream", function (stream) {
        console.log("receiving stream!!!");
        audioPlayer.src = URL.createObjectURL(stream);
      });

      peer.on("data", function (data) {
        console.log("receiving data", typeof data);

        // received audio clips from peer
        if (typeof data === "object") {
          const blob = new Blob([data]);
          audioPlayer.src = URL.createObjectURL(blob);
        } else {
          dataArray.unshift(data);
          // received x, y movements from peer
          if (
            Number(dataArray[0]) == dataArray[0] &&
            Number(dataArray[1]) == dataArray[1]
          ) {
            console.log("incoming data are numbers");
            let moveX = Number(dataArray[0]);
            let moveY = Number(dataArray[1]);
            updateRemotePeer(moveX, moveY);
            // reset data array
            dataArray = [];
          } else if (dataArray[0] != null && dataArray[1] != null) {
            if (
              Number(dataArray[0]) != dataArray[0] &&
              Number(dataArray[1]) != dataArray[1]
            ) {
              console.log(
                `incoming ${dataArray[0]} ${dataArray[1]} is not a number`
              );
              incomingPrivateMsg(dataArray[0], dataArray[1]);
              // reset data array
              dataArray = [];
            }
          }
        }
      });

      // show list of peers by their ID
      console.log("peers are", peers);
    });

    // SOCKET.IO + ARCHIVAL
    // Whenever the server emits 'new message', update the chat body
    socket.on("public message", (data) => {
      console.log(
        "===============socket public message event========================="
      );
      const clientName = data.name;
      incomingPublicMsg = data.msg;
      addPublicMsg(clientName, incomingPublicMsg);
    });
    sendPos();
  };
  // this.draw = function draw() {};
});

function messageUI() {
  // private msg HTML elements
  privateMsg = document.querySelector("#_privateMsg"); // private messages go here
  publicMsg = document.querySelector("#_publicMsg"); // public messages go here
  messageInput = document.querySelector("#_messageInput"); // text input for message
  sendBtn = document.querySelector("#_sendBtn"); // send button
  historyBtn = document.querySelector("#_historyToggle"); // button to open history menu
  nameInput = document.querySelector("#_nameInput");

  // public msg HTML elements
  publicMsgInput = document.querySelector("#_publicMsgInput"); // text input for message
  publicSendBtn = document.querySelector("#_publicSendBtn"); // send button

  // set events for sending message > trigger the sendMessage() function
  sendBtn.addEventListener("click", sendMessage);
  // historyBtn.addEventListener("click", history);

  // -> for when "enter" is pressed in input field
  messageInput.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      sendMessage();
      return false;
    }
  });
}

let userUI = () => {
  // user HTML elements
  user = document.getElementById("user");

  // get user initial position
  userX = ui.getUserPos()[0];
  userY = ui.getUserPos()[1];

  // generate a random user color
  randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
  user.style.backgroundColor = randomColor;

  return randomColor;
};

function sendPos() {
  let moveX = 0;
  let moveY = 0;
  privateMsgToggle.addEventListener("keydown", function (e) {
    switch (e.which) {
      case 37: //left arrow key
        moveX = -cell;
        break;
      case 38: //up arrow key
        moveY = -cell;
        break;
      case 39: //right arrow key
        moveX = cell;
        break;
      case 40: //bottom arrow key
        moveY = cell;
        break;
    }
    for (let peer of Object.values(peers)) {
      // keep in this order to accomodate unshift()
      peer.send(moveY);
      peer.send(moveX);
    }
    moveX = 0;
    moveY = 0;
    // hide system & private msg when a key is pressed
    removeSysMsg();
    hidePrivateMsg();
  });
}

function peerUI() {
  privateChatBox = document.querySelector("#privateMsgToggle"); // private chat box
  peer = document.createElement("div");
  privatePeerIndex += 1;
  peer.setAttribute(`id`, `peer${privatePeerIndex}`);
  peer.setAttribute(`class`, `square`);
  // generate a random user color
  let peerColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
  peer.style.backgroundColor = peerColor;
  privateChatBox.appendChild(peer);

  peerPos = $(`#peer${privatePeerIndex}`).position();
  peerX = peerPos.left;
  peerY = peerPos.top;

  // for (let i = 0; i < peerArray.length; i++) {
  // $peerPos.push($(`#peer${privatePeerIndex}`).position());
  // $pastX[i] = $peerPos[i].left;
  // $pastY[i] = $peerPos[i].top;
  // console.log(`peer X is ${$pastX[i]} and peer Y is ${$pastY[i]}`);
  // }
}

// update the positions of remote peers
function updateRemotePeer(currentX, currentY) {
  console.log(currentX);
  let direction;
  if (currentX > 0 || currentY > 0) {
    direction = "+=";
    // keeping track of peer's global location
    peerX += currentX;
    peerY += currentY;
  } else if (currentX < 0 || currentY < 0) {
    direction = "-=";
    currentX = -currentX;
    currentY = -currentY;
    // keeping track of peer's global location
    peerX -= currentX;
    peerY -= currentY;
  }

  $(function () {
    $(`#peer${privatePeerIndex}`)
      .finish()
      .animate({
        left: `${direction}${currentX}`, // why doesn't left work???
        top: `${direction}${currentY}`,
      });

    userX = ui.getUserPos()[0];
    userY = ui.getUserPos()[1];

    // console.log("current peer location is: " + peerX, peerY);
    // console.log("current user location is: " + userX, userY);

    if (peerX == userX && peerY == userY) {
      console.log(`YOU ARE OVERLAPPED ^_^`);
      // addSystemMsg();
    } else if (
      (peerX == userX + cell && peerY == userY) ||
      (peerX == userX - cell && peerY == userY) ||
      (peerY == userY + cell && peerX == userX) ||
      (peerY == userY - cell && peerX == userX)
    ) {
      let replyThreadMsg = `Reply Thread`;
      console.log(`START A THREAD? ?_?`);
      addSystemMsg(replyThreadMsg);
    }
  });
}

// audio
stopRecordButton.addEventListener("click", () => {
  console.log("clicked");
  shouldStop = true;
});

sendButton.addEventListener("click", () => {
  console.log("trying to send");
  sendBlob(blob);
});

const captureAudio = () => {
  [stopped, shouldStop] = [false, false];
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: false,
    })
    .then((stream) => {
      console.log("getting stream");
      const options = { mimeType: "audio/webm" };
      const recordedChunks = [];
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.addEventListener("dataavailable", (e) => {
        console.log("we are getting data");
        if (e.data.size > 0) {
          recordedChunks.push(e.data);
        }
        if (shouldStop === true && stopped === false) {
          console.log("we are stopping");
          mediaRecorder.stop();
          stopped = true;
        }
      });

      mediaRecorder.addEventListener("stop", () => {
        console.log("we are stopping");
        blob = new Blob(recordedChunks);
        recording = URL.createObjectURL(blob);
        audioPlayer.src = recording;
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      });

      mediaRecorder.start(1000);
    })
    .catch((err) => {
      console.log("err capturing audio", err);
    });
};

recordButton.addEventListener("click", captureAudio);
function sendBlob(blob) {
  blob.arrayBuffer().then((buffer) => {
    for (let peer of Object.values(peers)) {
      if ("addStream" in peer) {
        peer.send(buffer);
      }
    }
  });
}

// fails on webrtc not open if > 2
// how do we ensure that webrtc is listening?
function sendMessage() {
  let name = "Anonymous";

  if (nameInput.value != "") {
    name = nameInput.value;
  }

  if (messageInput.value != "") {
    outgoingMsg = messageInput.value;
    // send private message
    if (
      $(".privateMsg").is(":visible") == true &&
      $(".publicMsg").is(":visible") == false
    ) {
      console.log("about to send to peers. what are they?", peers);
      for (let peer of Object.values(peers)) {
        if ("send" in peer) {
          // keep it in this order to accomodate unshift()
          peer.send(outgoingMsg);
          peer.send(name);
        }
      }
      outgoingPrivateMsg(name, outgoingMsg);
    }
    // send public message
    else if (
      $(".publicMsg").is(":visible") == true &&
      $(".privateMsg").is(":visible") == false
    ) {
      socket.emit("public message", {
        name: name,
        outgoingMsg: outgoingMsg,
      });
      archivePublicMsg(name, outgoingMsg);
      addPublicMsg(name, outgoingMsg);
    }
    // send private message
    else if (
      $(".publicMsg").is(":visible") == true &&
      $(".privateMsg").is(":visible") == true
    ) {
      console.log("about to send to peers. what are they?", peers);
      for (let peer of Object.values(peers)) {
        if ("send" in peer) {
          peer.send([name, outgoingMsg]);
        }
      }
      outgoingPrivateMsg(name, outgoingMsg);
    }
    console.log(`sending message: ${outgoingMsg}`); // note: using template literal string: ${variable} inside backticks
    // clear input field
    messageInput.value = "";
  } else {
    alert("your message is empty");
  }
}

function addSystemMsg(systemMsg) {
  addSysBubble(systemMsg);

  // privateMsg.insertAdjacentHTML(
  //     "beforeend",
  //     `<div class="message" id="systemMsg">
  //     <p>${systemMsg}</p>
  //     </div>`
  // );
  // // auto-scroll message container
  // privateMsg.scrollTop = privateMsg.scrollHeight - privateMsg.clientHeight;
}

function removeSysMsg() {
  for (let i = 1; i <= sysMsgIndex; i++) {
    let sysBlb = document.getElementById(`sysBlb${i}`);
    sysBlb.style.display = "none";
  }
}

function incomingPrivateMsg() {}

function outgoingPrivateMsg(name, msg) {
  removeSysMsg();
  // add txt bubble to avatar
  outgoingMsgIndex++;
  addTxtBubble(user, name, msg);
  // add msg record to chatroom
  outgoingMsgIndex++;
  let txtRecord = document.createElement("div");
  txtRecord.setAttribute(`id`, `txtRecord${outgoingMsgIndex}`);
  txtRecord.setAttribute(`class`, `txtRecord`);
  privateChatBox.appendChild(txtRecord);
  userX = ui.getUserPos()[0];
  userY = ui.getUserPos()[1];
  $(`#txtRecord${outgoingMsgIndex}`).css({
    left: `${userX}px`,
    top: `${userY}px`,
    backgroundColor: `${randomColor}`,
  });
  // add txt bubble to txt record
  addTxtBubble(txtRecord, name, msg);

  // vanilla text chat interface
  //   let today = new Date();
  // let time = today.getHours() + ":" + today.getMinutes();
  // privateMsg.insertAdjacentHTML(
  //     "beforeend",
  //     `<div class="row">
  //     <div id="_privateName">
  //     <p>${name}</p>
  //     </div>
  //     <div id="_privateStamp">
  //     <p>${time}</p>
  //     </div>
  //     </div>
  //     <div class="message" id="message${outgoingMsgIndex}">
  //     <p>${outgoingMsg}</p>
  //     </div>`
  // );
  // auto-scroll message container
  // privateMsg.scrollTop = privateMsg.scrollHeight - privateMsg.clientHeight;
  // if user is in the other chat mode, send notification
  if (
    $(".publicMsg").is(":visible") == true &&
    $(".privateMsg").is(":visible") == false
  ) {
    $("#_privacyToggle").css("border", "1px solid red");
  } else {
    $("#_privacyToggle").css("border", "1px solid black");
  }
}

function addTxtBubble(parent, name, msg) {
  // add text bubble to avatar
  let txtBlb = document.createElement("div");
  txtBlb.setAttribute(`id`, `txtBlb${outgoingMsgIndex}`);
  txtBlb.setAttribute(`class`, `txtBlb`);
  txtBlb.innerHTML = `<p><b>${name}</b></p><p>${msg}</p>`;
  parent.appendChild(txtBlb);
}

function addSysBubble(systemMsg) {
  sysMsgIndex++;
  let sysBlb = document.createElement("div");
  sysBlb.setAttribute(`id`, `sysBlb${sysMsgIndex}`);
  sysBlb.setAttribute(`class`, `sysBlb`);
  sysBlb.innerHTML = `<p>${systemMsg}</p>`;
  user.appendChild(sysBlb);
}

function hidePrivateMsg() {
  for (let i = 1; i <= outgoingMsgIndex; i++) {
    let txtBlb = document.getElementById(`txtBlb${i}`);
    txtBlb.style.visibility = "hidden";
  }
  togglePrivateMsg();
}

function togglePrivateMsg() {
  for (let i = 1; i <= outgoingMsgIndex; i++) {
    $(`#txtRecord${i}`)
      .mouseenter(function () {
        $(`#txtBlb${i}`).css("visibility", "visible");
      })
      .mouseleave(function () {
        $(`#txtBlb${i}`).css("visibility", "hidden");
      });
  }
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
  if (
    $(".publicMsg").is(":visible") == false &&
    $(".privateMsg").is(":visible") == true
  ) {
    $("#_privacyToggle").css("border", "1px solid red");
  } else {
    $("#_privacyToggle").css("border", "1px solid black");
  }
}

function archivePublicMsg(name, outgoingMsg) {
  let outgoingPublicJson = {
    name: name,
    msg: outgoingMsg,
  };

  console.log(outgoingPublicJson);

  // send msg to archive/
  fetch(url + archive, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(outgoingPublicJson),
  })
    .then((res) => {
      return res.text();
    })
    .then((data) => {
      console.log(data);
    }); // posting url, object,
}

function loadHistory() {
  getData();
  // pull history from the record
  async function getData() {
    const res = await fetch(url + record, {
      method: "GET",
    });
    const data = await res.json();
    console.log(data[0].time, data[0].author, data[0].msg);

    for (let i = 0; i < data.length; i++) {
      name = data[i].author;
      time = data[i].time;
      historyMsg = data[i].msg;
      publicMsgIndex = i;
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
                <p>${historyMsg}</p>
                </div>`
      );
    }
  }
}
