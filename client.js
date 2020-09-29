// Exports node modules
const Peer = require("simple-peer");
const io = require("socket.io-client");
const p5 = require("p5");
const ui = require("./ui");

const { update } = require("lodash");
// const url = "https://togethernet.herokuapp.com";
const url = "http://localhost:3000";
const archive = "/archive";
const record = "/record";

// Simple Peer
let user;
let userX, userY;
let name = "Anonymous";
let peer;
let peerPos, peerX, peerY;
const peers = {};
let dataArray = [];
let cell = 50; // cell size
let userColor, peerColor;
let userPosArray = [];
let peerPosArray = [];
let posArray = []; // userPosArray + peerPosArray

// HTML elements
let privateChatBox;
let privateMsg;
let publicMsg;
let messageInput; // text field to type message
let sendBtn; // button to send message
let historyBtn; // button to open history menu
let stopSendMsg = false;

let publicMsgIndex = 0;
let incomingMsgIndex = 0;
let msgIndex = 0;
let privatePeerIndex = 0;
let sysMsgIndex = 0;

let incomingMsg;
let outgoingMsg;
let outgoingPublicMsg;
let incomingPublicMsg;
let historyMsg;

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
    const socket = io.connect(); // Manually opens the socket
    messageUI();
    userUI();
    loadHistory();

    // SOCKET.IO + SIMPLE PEER
    // Connects to the Node signaling server
    socket.on("connect", function () {
      console.log('socket connect event');
      // System broadcast
      let connectedMsg = `Searching for peers...`;
      addSystemMsg(connectedMsg);

      // print your peer ID in the console
      console.log(`${connectedMsg}, your peer ID is ${socket.id}`);
    });

    socket.on("peer", function (data) {
      console.log('socket peer event');
      console.log("connecting to new peer");
      let peerId = data.peerId; //id of remote peer (provided by server)
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

      // Create peer UI
      if (!(peerId in peers)) {
        // if peerId exists as keys in peers
        peerUI();
      }

      //maintain global list of peers
      peers[peerId] = peer;
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
          "socket signal event"
        );
        console.log("receiving data", data);
        if (data.peerId == peerId) {
          console.log("sending peer signal");
          peer.signal(data.signal);
        }
      });

      peer.on("error", function (e) {
        delete peers[peerId];
        peer.destroy();
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
        console.log(peers, peerId);
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
        "socket public message event"
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
  privateChatBox = document.querySelector("#privateMsgToggle"); // private chat box
  publicMsg = document.querySelector("#_publicMsg"); // public messages go here
  messageInput = document.querySelector("#_messageInput"); // text input for message
  // sendBtn = document.querySelector("#_sendBtn"); // send button
  historyBtn = document.querySelector("#_historyToggle"); // button to open history menu
  nameInput = document.querySelector("#_nameInput");

  // public msg HTML elements
  publicMsgInput = document.querySelector("#_publicMsgInput"); // text input for message
  publicSendBtn = document.querySelector("#_publicSendBtn"); // send button

  // set default name
  nameInput.innerHTML = name;
  nameInput.addEventListener("click", userName);

  // send msg
  // through click
  // sendBtn.addEventListener("click", sendMessage);
  // through key
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
  userProfile = document.getElementById("userProfile");

  // get user initial position
  userX = ui.getUserPos()[0]; //x
  userY = ui.getUserPos()[1]; //y

  // generate a random user color
  userColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  // then assign randomized color to user and userProfile
  user.style.backgroundColor = userColor;
  userProfile.value = userColor;

  // listens to changes in the color picker to change user and userProfile colors
  userProfile.addEventListener("change", function () {
    userColor = userProfile.value;
    document.getElementById("user").style.backgroundColor = userColor;
    console.log("changed color" + userProfile.value);
  });
};

function userName() {
  let txt;
  name = prompt("Please enter your name:");
  if (name == null || name == "") {
    name = "Anonymous";
  } else {
    nameInput.innerHTML = name;
  }
}

function sendPos() {
  console.log('setting up event listener');
  $(privateMsgToggle).keydown(function (evt) {
    evt = evt || window.event;
    setTimeout(function () {
      // hide system & private msg when a key is pressed
      removeSysMsg();
      hidePrivateMsg();

      userX = ui.getUserPos()[0]; //x
      userY = ui.getUserPos()[1]; //y

      // console.log("local pos is : " + userX, userY);
      for (let peer of Object.values(peers)) {
        // keep in this order to accomodate unshift()
        if(peer && 'send' in peer){
          console.log('peer is', peer)
          peer.send(userY);
          peer.send(userX);
        }
      }

      // console.log(posArray.length, msgIndex + msgIndex);
      // check if avatar & user's text records are overlapped or adjacent
      for (let i = 0; i < posArray.length; i++) {
        let posX = posArray[i][0];
        let posY = posArray[i][1];
        if (userX == posX && userY == posY) {
          getConsent(evt);
        } else if (
          (posX == userX + cell && posY == userY) ||
          (posX == userX - cell && posY == userY) ||
          (posY == userY + cell && posX == userX) ||
          (posY == userY - cell && posX == userX)
        ) {
          replyThread(evt, i);
        } else {
          // allow user to send new msg
          stopSendMsg = false;
        }
      }
    }, 0);
  });
}

function getConsent(evt) {
  let getConsent = `Ask for Consent?`;
  console.log(`YOU ARE OVERLAPPED ^_^`);
  addSystemMsg(getConsent);
  if (evt.keyCode == 13) {
    let getConsent = `Can I get your consent to archive this message?`;
    console.log("ASK FOR CONSENT");
    for (let peer of Object.values(peers)) {
      if (peer && "send" in peer) {
        // keep it in this order to accomodate unshift()
        peer.send(getConsent);
        peer.send(name);
      }
    }
  }
  // prevents user from sending msg when it overlaps peer's txtrecord
  stopSendMsg = true;
}

function replyThread(evt, txtRecordNum) {
  // let replyThread = `Reply Thread?`;
  console.log(`START A THREAD? ?_?`);
  // addSystemMsg(replyThread);

  setTimeout(function () {
    let txtBlb = document.getElementById(`txtBlb${txtRecordNum}`);
    if (txtBlb) {
      txtBlb.style.visibility = "visible";
    }
  }, 0);

  if (evt.keyCode == 13) {
    console.log("MAKE THREAD");
  }
  // allow user to reply thread
  stopSendMsg = false;
}

function peerUI() {
  peer = document.createElement("div");
  privatePeerIndex += 1;
  peer.setAttribute(`id`, `peer${privatePeerIndex}`);
  peer.setAttribute(`class`, `square`);
  // generate a random user color
  peerColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
  peer.style.backgroundColor = peerColor;
  privateChatBox.appendChild(peer);

  peerPos = $(`#peer${privatePeerIndex}`).position();
  peerX = peerPos.left;
  peerY = peerPos.top;
}

// update the positions of remote peers
function updateRemotePeer(currentX, currentY) {
  console.log(currentX, currentY);
  $(function () {
    $(`#peer${privatePeerIndex}`)
      .finish()
      .offset({
        left: `${currentX}`,
        top: `${currentY}`,
      });

    // get the latest user x y and peer x y
    userX = ui.getUserPos()[0];
    userY = ui.getUserPos()[1];
    peerX = currentX;
    peerY = currentY;
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
      if (peer && "addStream" in peer && "send" in peer) {
        peer.send(buffer);
      }
    }
  });
}

// fails on webrtc not open if > 2
// how do we ensure that webrtc is listening?
function sendMessage() {
  if (!stopSendMsg && messageInput.value != "") {
    outgoingMsg = messageInput.value;
    // send private message
    if (
      $(".privateMsg").is(":visible") == true &&
      $(".publicMsg").is(":visible") == false
    ) {
      console.log("about to send to peers. what are they?", peers);
      for (let peer of Object.values(peers)) {
        if (peer && "send" in peer) {
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
        if (peer && "send" in peer) {
          peer.send([name, outgoingMsg]);
        }
      }
      outgoingPrivateMsg(name, outgoingMsg);
    }
    console.log(`sending message: ${outgoingMsg}`); // note: using template literal string: ${variable} inside backticks
    // clear input field
    messageInput.value = "";
  } else if (stopSendMsg) {
    alert("move to an empty spot to write the msg");
  } else if (messageInput.value == "") {
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
  for (let i = 0; i < sysMsgIndex; i++) {
    let sysBlb = document.getElementById(`sysBlb${i}`);
    sysBlb.style.display = "none";
  }
}

function incomingPrivateMsg(name, msg) {
  addTempBubble(peer, name, msg);
  // add txt record
  $(`#txtRecord${msgIndex}`).css({
    left: `${peerX}px`,
    top: `${peerY}px`,
    backgroundColor: `${peerColor}`,
  });
  addTxtRecord(peerX, peerY, peerColor, name, msg);
  // store peer txtRecord positions
  peerPosArray.push([peerX, peerY]);
  posArray.push([peerX, peerY]);
  // add 1 to msgIndex
  msgIndex++;
}

function outgoingPrivateMsg(name, msg) {
  // add user bubble
  removeSysMsg();
  addTempBubble(user, name, msg);
  // add txt record
  userX = ui.getUserPos()[0];
  userY = ui.getUserPos()[1];
  addTxtRecord(userX, userY, userColor, name, msg);
  // store peer txtRecord positions
  userPosArray.push([userX, userY]);
  posArray.push([userX, userY]);
  // add 1 to msgIndex
  msgIndex++;
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
  //     <div class="message" id="message${msgIndex}">
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

function addTxtRecord(x, y, color, name, msg) {
  let txtRecord = document.createElement("div");
  txtRecord.setAttribute(`id`, `txtRecord${msgIndex}`);
  txtRecord.setAttribute(`class`, `txtRecord`);
  privateChatBox.appendChild(txtRecord);

  $(`#txtRecord${msgIndex}`).css({
    left: `${x}px`,
    top: `${y}px`,
    backgroundColor: `${color}`,
  });

  // append txt bubble to txt record
  addTxtBubble(txtRecord, name, msg);
}

function addTxtBubble(parent, name, msg) {
  // add text bubble to txt record
  let txtBlb = document.createElement("div");
  console.log(parent);
  txtBlb.setAttribute(`id`, `txtBlb${msgIndex}`);
  txtBlb.setAttribute(`class`, `txtBlb`);
  txtBlb.innerHTML = `<p><b>${name}</b></p><p>${msg}</p>`;
  parent.appendChild(txtBlb);
}

function addSysBubble(systemMsg) {
  let sysBlb = document.createElement("div");
  sysBlb.setAttribute(`id`, `sysBlb${sysMsgIndex}`);
  sysBlb.setAttribute(`class`, `sysBlb`);
  sysBlb.innerHTML = `<p>${systemMsg}</p>`;
  user.appendChild(sysBlb);
  sysMsgIndex++;
}

function addTempBubble(parent, name, msg) {
  // add text bubble to avatar
  let txtBlb = document.createElement("div");
  console.log(parent);
  txtBlb.setAttribute(`id`, `tempBlb${msgIndex}`);
  txtBlb.setAttribute(`class`, `txtBlb`);
  txtBlb.innerHTML = `<p><b>${name}</b></p><p>${msg}</p>`;
  parent.appendChild(txtBlb);
}

function hidePrivateMsg() {
  setTimeout(function () {
    for (let i = 0; i < msgIndex; i++) {
      let txtBlb = document.getElementById(`txtBlb${i}`);
      let tempBlb = document.getElementById(`tempBlb${i}`);
      if (tempBlb) {
        // remove temp bubble permenantly
        tempBlb.style.display = "none";
      }
      if (txtBlb) {
        txtBlb.style.visibility = "hidden";
        $(`#txtRecord${i}`)
          .mouseenter(function () {
            $(txtBlb).css("visibility", "visible");
          })
          .mouseleave(function () {
            $(txtBlb).css("visibility", "hidden");
          });
      }
    }
  }, 0);
  //   for (let i = 1; i <= msgIndex; i++) {
  //     let txtBlb = document.getElementById(`txtBlb${i}`);
  //     txtBlb.style.visibility = "hidden";
  //     $(`#txtRecord${i}`)
  //       .mouseenter(function () {
  //         $(`#txtBlb${i}`).css("visibility", "visible");
  //       })
  //       .mouseleave(function () {
  //         $(`#txtBlb${i}`).css("visibility", "hidden");
  //       });
  //   }
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
    // console.log(data[0].time, data[0].author, data[0].msg);

    for (let i = 0; i < data.length; i++) {
      name = data[i].author;
      time = data[i].time;
      historyMsg = data[i].msg;
      publicMsgIndex = i;

      archiveView = document.querySelector("#_publicMsg"); // archive view
      entry = document.createElement("div");
      entry.setAttribute(`id`, `entry${publicMsgIndex}`);
      entry.setAttribute(`class`, `entry`);
      // generate a random user color
      peerColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
      entry.style.backgroundColor = peerColor;
      archiveView.appendChild(entry);

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
