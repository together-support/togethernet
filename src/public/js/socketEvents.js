import Peer from 'simple-peer';

import { onSimplePeerSignal, onSimplePeerError, onSimplePeerData, onSimplePeerStream, onSimplePeerConnect } from './peerEvents.js';

export const attachSocketEvents = (socket) => {
  // // SOCKET.IO + SIMPLE PEER
  // // Connects to the Node signaling server
  // socket.on("connect", function () {
  //   console.log("socket connect event");
  //   // System broadcast
  //   let connectedMsg = `Searching for peers...`;
  //   addSystemMsg(connectedMsg);

  //   // print your peer ID in the console
  //   console.log(`${connectedMsg}, your peer ID is ${socket.id}`);
  // });

  // socket.on("peer", onSocketPeer);
  // socket.on("public message", onSocketPublicMessage);
}

const onSocketPublicMessage = (data) => {
  // console.log("socket public message event");
  // const clientName = data.name;
  // incomingPublicMsg = data.msg;
  // addPublicMsg(clientName, incomingPublicMsg); 
}

const onSocketSignal = (data) => {
  // console.log("client: ===============peer signal event=========================", data);
 
  // if (data.peerId == peerId) {
  //   console.log("sending peer signal");
  //   peer.signal(data.signal);
  // }
}

const onSocketPeer = (data) => {
  // console.log("socket peer event");
  // console.log("connecting to new peer");
  // let peerId = data.peerId; //id of remote peer (provided by server)
  // // opens up possibility for a connection/configuration
  // const peer = new Peer({
  //   objectMode: true,
  //   initiator: data.initiator,
  //   trickle: false,
  // });

  // // Create peer UI
  // if (!(peerId in peers)) {
  //   // if peerId exists as keys in peers
  //   peerUI();
  // }

  // peers[peerId] = peer;
 
  // peer.on("signal", onSimplePeerSignal);
  // peer.on("error", onSimplePeerError);
  // peer.on("connect", onSimplePeerConnect)
  // peer.on("stream", onSimplePeerStream)
  // peer.on("data", onSimplePeerData);

  // socket.on("signal", onSocketSignal);
}
