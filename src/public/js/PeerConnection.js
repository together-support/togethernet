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
    this.socket.on('connect', this.enteredRoom)
    this.socket.on('offer', this.handleReceivedOffer);
    this.socket.on('answer', this.handleReceivedAnswer);
    this.socket.on('candidate', this.addCandidate);
    this.socket.on('peerLeave', this.handlePeerLeave);
    this.socket.on('disconnect', this.handleLeave);
    this.socket.on('error', this.handleError);
  }

  enteredRoom = async () => {
    this.initPeerConnection();
    await this.sendOffers();
  }
 
  initPeerConnection = () => {
    this.peerConnection = new this._wrtc.RTCPeerConnection({ 
      "iceServers": [{
        url: 'stun:stun.l.google.com:19302'
      }],
      sdpSemantics: 'unified-plan'
    });

    this.peerConnection.onicecandidate = (event) => { 
      if (Boolean(event.candidate)) { 
        this.send({type: "trickleCandidate", candidate: new this._wrtc.RTCIceCandidate(event.candidate)}); 
      } 
    };
  }

  sendOffers = async () => { 
    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true
      });
      await this.peerConnection.setLocalDescription(offer); 
      this.openDataChannel();
      this.send({type: "sendOffers", offer});
    } catch (e) {
      alert("error creating offer to connect to peers", e); 
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
    window.dataChannel = dataChannel
  }

  handleReceivedOffer = async ({offer, offerInitiator}) => { 
    try {
      await this.peerConnection.setRemoteDescription(new this._wrtc.RTCSessionDescription(offer)); 
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer); 
      console.log(`received an offer - generated answer ${answer}`)
      this.send({type: "sendAnswer", answer, offerInitiator});
    } catch (err) {
      console.log('error receiving offer', err)
    }
  }
 
  handleReceivedAnswer = async ({answer}) => { 
    console.log(`received answer - ${answer}`)
    window.pc = this.peerConnection
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

  handlePeerLeave = ({leavingUser}) => {
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
