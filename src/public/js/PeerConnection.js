import io from 'socket.io-client';
import store from '../store/store.js'
import {getBrowserRTC} from './ensureWebRTC.js'

export default class PeerConnection {
  constructor () {
    this._wrtc = getBrowserRTC();
    this.socket = io.connect();
    this.peerConnection = null;
    this.channelName = store.get('room');
    this.initiator = false
  }

  connect = () => {
    this.socket.on('connect', () => {
      this.send({type: 'enterRoom'});
    })
    this.socket.on('enteredRoom', this.enteredRoom);
    this.socket.on('offer', this.handleReceivedOffer);
    this.socket.on('answer', this.handleReceivedAnswer);
    this.socket.on('candidate', this.addCandidate);
    this.socket.on('leave', this.handleLeave);
    this.socket.on('error', this.handleError);
  }

  enteredRoom = async () => {
    this.initPeerConnection();
    await this.signalToPeers();
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
        this.send({type: "trickleCandidate", candidate: new this._wrtc.RTCIceCandidate(event.candidate)}); 
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
      this.openDataChannel();
      this.send({type: "sendOffers", offer});
    } catch (e) {
      alert("error creating offer to connect to peers"); 
    }
  }

  openDataChannel = () => {	
    const dataChannel = this.peerConnection.createDataChannel("myDataChannel", { 
      reliable: true 
    });
	
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
  }

  handleReceivedOffer = async ({offer, offerInitiator}) => { 
    try {
      this.peerConnection.addEventListener('datachannel', e => {
        alert(e)
      });
      await this.peerConnection.setRemoteDescription(new this._wrtc.RTCSessionDescription(offer)); 
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
    await this.peerConnection.setRemoteDescription(new this._wrtc.RTCSessionDescription(answer)); 
  } 

  addCandidate = async ({candidate}) => { 
    try {
      await this.peerConnection.addIceCandidate(candidate); 
    } catch (e) {
      console.log('error adding received ice candidate', e)
    }
  }

  handleError = (e) => {
    console.log('error', e)
  }

  handleLeave = ({leavingUser}) => {
    console.log(`${leavingUser} left`)
  }

  handleLeave = () => {
    this.peerConnection.close();
    this.peerConnection.onicecandidate = null;
  }

  send = (data) => {
    this.socket.emit(data.type, {
      ...data, 
      fromSocket: this.socket.id,
      fromName: store.get('name')
    });
  }
}
