import io from 'socket.io-client';
import store from '../store/store.js'

export default class PeerConnection {
  constructor () {
    this.socket = io.connect();
    this.socketId = null;
    this.peerConnection = null;
    this.dataChannel = null;
  }

  connect = () => {
    this.socket.on('connect', this.handleConnect)
    this.socket.on('message', this.handleMessage)
    this.socket.on('close', this.handleLeave)
    this.socket.on('error', this.handleError)
  }

  handleConnect = () => {
    this.socketId = this.socket.id;
    this.send({type: 'enterRoom'})
  }

  handleMessage = (message) => {
    let data; 
    try { 
       data = JSON.parse(message); 
    } catch (e) { 
       console.log("Invalid JSON"); 
       data = {}; 
    } 

    switch(data.type) {
      case "enteredRoom":
        this.enteredRoom(data)
        break;
      case "offer":
        this.handleReceivedOffer(data); 
        break; 
      case "answer":
        this.handleReceivedAnswer(data); 
        break; 
      case "candidate": 
        this.onCandidate(data); 
        break; 
      default: 
        break; 
    } 
  }; 

  enteredRoom = ({success}) => {
    if (success) {
      this.initPeerConnection();
      this.connectToPeers();
      this.initializeOrJoinDataChannel();
    } else {
      alert('error connecting. already connected!')
    }
  }
 
  initializeOrJoinDataChannel = () => {
  }

  initPeerConnection = () => {
    const configuration = { 
      "iceServers": [{ "url": "stun:stun.1.google.com:19302" }] 
    };
    this.peerConnection = new webkitRTCPeerConnection(configuration, {
      optional: [{RtpDataChannels: true}]
    });

    this.peerConnection.onicecandidate = (event) => { 
      if (event.candidate) { 
        this.send({type: "shareCandidate", candidate: event.candidate}); 
      } 
    }; 
  }

  connectToPeers = () => { 
    this.peerConnection.createOffer((offer) => { 
      this.send({type: "sendOffers", offer});
      this.peerConnection.setLocalDescription(offer); 
    }, (error) => { 
      alert("error connecting to peers"); 
    }); 
  }

  handleReceivedOffer = ({offer, offerInitiator}) => { 
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer)); 
    this.peerConnection.createAnswer((answer) => { 
      this.peerConnection.setLocalDescription(answer); 
      this.send({type: "sendAnswer", answer, offerInitiator});
    }, (error) => { 
      alert("error receiving offer"); 
    }); 
  }
 
  handleReceivedAnswer = ({answer}) => { 
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer)); 
  } 

  onCandidate = ({candidate}) => { 
    this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)); 
  }

  handleError = () => {
    console.log('error')
  }

  handleLeave = () => {
    this.peerConnection.close();
    this.peerConnection.onicecandidate = null;
  }

  send = (data) => {
    this.socket.send(JSON.stringify({
      ...data, 
      fromSocket: this.socketId,
      fromName: store.get('name')
    }));
  }
}
