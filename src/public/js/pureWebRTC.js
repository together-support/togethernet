import io from 'socket.io-client';
import store from '../store/store.js'
import {getBrowserRTC} from './ensureWebRTC.js'

export default class PeerConnection {
  constructor () {
    this._wrtc = getBrowserRTC();
    this.socket = io.connect();
    this.socketId = null;
    this.peerConnection = null;
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

  handleMessage = async (message) => {
    let data; 
    try { 
       data = JSON.parse(message); 
    } catch (e) { 
       console.log("Invalid JSON"); 
       data = {}; 
    } 

    switch(data.type) {
      case "enteredRoom":
        await this.enteredRoom(data)
        break;
      case "offer":
        this.handleReceivedOffer(data); 
        break; 
      case "answer":
        this.handleReceivedAnswer(data); 
        break; 
      case "candidate": 
        this.addCandidate(data); 
        break; 
      default: 
        break; 
    } 
  }; 

  enteredRoom = async ({success}) => {
    if (success) {
      this.initPeerConnection();
      this.signalToPeers();
    } else {
      alert('error connecting. already connected!')
    }
  }
 
  initPeerConnection = () => {
    this.peerConnection = new this._wrtc.RTCPeerConnection({ 
      "iceServers": [{
        url: 'stun:stun.l.google.com:19302'
      }] 
    });

    this.peerConnection.onicecandidate = (event) => { 
      console.log('onicecandidate')
      if (event.candidate) { 
        this.send({type: "shareCandidate", candidate: this._wrtc.RTCIceCandidate(event.candidate)}); 
      } 
    };

    this.peerConnection.onconnectionstatechange = (e) => {
      alert('hello!!')
      console.log(e);
    };
  }

  signalToPeers = async () => { 
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer); 
      this.send({type: "sendOffers", offer});
    } catch (e) {
      alert("error creating offer to connect to peers"); 
    }
  }

  openDataChannel = () => {	
    const dataChannel = this.peerConnection.createDataChannel("myDataChannel", { 
      reliable: true 
    });

    this.peerConnection.addEventListener('datachannel', e => {
      alert(e)
    })
	
    dataChannel.onerror = function (error) { 
      console.log("Error:", error); 
    };
	
    dataChannel.onmessage = function (event) { 
      console.log("Got message:", event.data); 
    };

    dataChannel.onopen = () => {
      alert('open')
      store.set('dataChannel', dataChannel);
    }
    console.log()
  }

  handleReceivedOffer = async ({offer, offerInitiator}) => { 
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer)); 
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer); 
      console.log(`received an offer - generated answer ${answer}`)
      this.send({type: "sendAnswer", answer, offerInitiator});
    } catch (e) {
      alert("error receiving offer"); 
    }
  }
 
  handleReceivedAnswer = async ({answer}) => { 
    console.log(`received answer - ${answer}`)
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer)); 
  } 

  addCandidate = async ({candidate}) => { 
    try {
      await this.peerConnection.addIceCandidate(candidate); 
    } catch (e) {
      console.log('error adding received ice candidate', e)
    }
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
