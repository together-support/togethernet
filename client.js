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
let randomColor;
let peer;
let peerArray = [];
const peers = {};
let dataArray = [];

// HTML elements
let privateChatBox;
let privateMsg;
let publicMsg;
let messageInput; // text field to type message
let sendBtn; // button to send message
let historyBtn; // button to open history menu

let publicMsgIndex = 0;
let privateMsgIndex = 0;
let privatePeerIndex = 0;

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
        // addSystemMsg(connectedPeerMsg);
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
          // received coordinates from peer
          if (
            Number(dataArray[0]) == dataArray[0] &&
            Number(dataArray[1]) == dataArray[1]
          ) {
            console.log("incoming data is a number");
            let userX = Number(dataArray[0]);
            let userY = Number(dataArray[1]);
            updateRemotePeer(userX, userY);
            // reset data array
            dataArray = [];
          } else if (
            Number(dataArray[0]) != dataArray[0] &&
            Number(dataArray[1]) != dataArray[1]
          ) {
            console.log(
              `incoming ${dataArray[0]} ${dataArray[1]} is not a number`
            );
            addPrivateMsg(dataArray[0], dataArray[1]);
            // // reset data array
            dataArray = [];
          }
        }
      });

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
  this.draw = function draw() {};
});

function sendPos() {
  let userX = 0;
  let userY = 0;
  privateMsgToggle.addEventListener("keydown", function (e) {
    switch (e.which) {
      case 37: //left arrow key
        userX = -50;
        break;
      case 38: //up arrow key
        userY = -50;
        break;
      case 39: //right arrow key
        userX = 50;
        break;
      case 40: //bottom arrow key
        userY = 50;
        break;
    }

    for (let peer of Object.values(peers)) {
      // keep in this order to accomodate unshift()
      peer.send(userY);
      peer.send(userX);
    }
    console.log(`user is going to x: ${userX} y: ${userY}`);
    userX = 0;
    userY = 0;
  });

  // for draggable

  // let userX = ui.getUserPos()[0];
  // let userY = ui.getUserPos()[1];
}

// let $peerPos = [];
// let $pastX = [];
// let $pastY = [];

function peerUI() {
  privateChatBox = document.querySelector("#privateMsgToggle"); // private chat box
  peer = document.createElement("div");
  privatePeerIndex += 1;
  peerArray = [`${privatePeerIndex}`];
  peer.setAttribute(`id`, `peer${privatePeerIndex}`);
  peer.setAttribute(`class`, `square yellow`);
  privateChatBox.appendChild(peer);

  $peerPos = $(`#peer${privatePeerIndex}`).position();
  $pastX = $peerPos.left;

  // for (let i = 0; i < peerArray.length; i++) {
  // $peerPos.push($(`#peer${privatePeerIndex}`).position());
  // $pastX[i] = $peerPos[i].left;
  // $pastY[i] = $peerPos[i].top;
  // console.log(`peer X is ${$pastX[i]} and peer Y is ${$pastY[i]}`);
  // }
}

let userUI = () => {
  // user HTML elements
  user = document.getElementById("user");

  // generate a random user color
  randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
  user.style.backgroundColor = randomColor;

  return randomColor;
};

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
      addPrivateMsg(name, outgoingMsg);
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
      addPrivateMsg(name, outgoingMsg);
    }
    console.log(`sending message: ${outgoingMsg}`); // note: using template literal string: ${variable} inside backticks
    // clear input field
    messageInput.value = "";
  } else {
    alert("your message is empty");
  }
}

function addSystemMsg(systemMsg) {
  // privateMsg.insertAdjacentHTML(
  //     "beforeend",
  //     `<div class="message" id="systemMsg">
  //     <p>${systemMsg}</p>
  //     </div>`
  // );
  // // auto-scroll message container
  // privateMsg.scrollTop = privateMsg.scrollHeight - privateMsg.clientHeight;
}

let $peerPos;
let $pastX;
let $pastY;

// update the positions of remote peers
function updateRemotePeer(currentX, currentY) {

  let direction;

  if (currentX > 0 || currentY > 0){
    direction = '+=';
  } else if (currentX < 0 || currentY < 0){
    direction = '-=';
    currentX = -currentX;
    currentY = -currentY;
  }
 $(function () {
      $(`#peer${privatePeerIndex}`)
        .finish()
        .animate({
          "margin-left": `${direction}${currentX}`,
          "margin-top": `${direction}${currentY}`,
        });

   //  if (currentX > $pastX) {
   //    $(`#peer${privatePeerIndex}`)
   //      .finish()
   //      .animate({
   //        "margin-left": `+=${cell}`,
   //      });
   //    console.log(
   //      `true that ${currentX} is bigger than ${$pastX}, so move to the right by ${cell}`
   //    );
   //  } else if (currentX < $pastX) {
   //     $(`#peer${privatePeerIndex}`)
   //           .finish()
   //           .animate({
   //             "margin-left": `-=${cell}`,
   //     });
   //    console.log(`it's not true that ${currentX} is bigger than ${$pastX}`);
   //  }
   //  console.log(
   //    `remote peers position is at ${currentX}, ${currentY}`
   //  );
   //  // reset peerX
   //  $pastX = currentX;
 });
}

function addPrivateMsg(name, outgoingMsg) {
  let today = new Date();
  let time = today.getHours() + ":" + today.getMinutes();

  privateMsgIndex++;

  // add text bubble to avatar
  let txtBlb = document.createElement("div");
  txtBlb.setAttribute(`id`, `txtBlb${privateMsgIndex}`);
  txtBlb.setAttribute(`class`, `txtBlb`);
  txtBlb.innerHTML = `<p><b>${name}</b></p><p>${outgoingMsg}</p>`;
  user.appendChild(txtBlb);
  let txtOpacity = 0.7;
  txtBlb.style.opacity = txtOpacity;

  // add msg record to chatroom
  let txtRecord = document.createElement("div");
  txtRecord.setAttribute(`id`, `txtRecord${privateMsgIndex}`);
  txtRecord.style.top = 50;
  txtRecord.setAttribute(`class`, `square txtRecord`);
  // textRecord.style["backgroundColor"] = randomColor;
  txtRecord.innerHTML = `<p><b>${name}</b></p><p>${outgoingMsg}</p>`;
  $(txtRecord).insertBefore(user);

  // vanilla text chat interface
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
  //     <div class="message" id="message${privateMsgIndex}">
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
