import io from 'socket.io-client';
import {addPeer, getPeer} from '../store/actions.js'
import store from '../store/store.js';
import {getBrowserRTC} from './ensureWebRTC.js'

export default class PeerConnection {
  constructor () {
    this._wrtc = getBrowserRTC();
    this.socket = io.connect();
    this.channelName = store.get('room');
    this.initiator = false;
  }

  connect = () => {
    this.socket.on('initConnections', this.initConnections)
    this.socket.on('offer', this.handleReceivedOffer);
    this.socket.on('answer', this.handleReceivedAnswer);
    this.socket.on('candidate', this.addCandidate);
    this.socket.on('peerLeave', this.handlePeerLeave);
    this.socket.on('disconnect', this.handleLeave);
    this.socket.on('error', this.handleError);
  }

  initConnections = async ({peer}) => {
    const peerConnection = this.initPeerConnection();
    addPeer(peer, peerConnection);

    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true
      });
      await peerConnection.setLocalDescription(offer); 
      this.send({type: "sendOffers", offer});
    } catch (e) {
      alert("error creating offer to connect to peers", e); 
    }
  }

  initPeerConnection = () => {
    const peerConnection = new this._wrtc.RTCPeerConnection({ 
      "iceServers": [{
        url: 'stun:stun.l.google.com:19302'
      }],
      sdpSemantics: 'unified-plan'
    });

    peerConnection.onicecandidate = (event) => { 
      if (Boolean(event.candidate)) { 
        this.send({type: "trickleCandidate", candidate: new this._wrtc.RTCIceCandidate(event.candidate)}); 
      } 
    };

    return peerConnection
  }

  handleReceivedOffer = async ({offer, offerInitiator}) => { 
    try {
      const peerConnection = this.initPeerConnection();
      await peerConnection.setRemoteDescription(new this._wrtc.RTCSessionDescription(offer)); 
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer); 
      addPeer(offerInitiator, peerConnection);
      this.send({type: "sendAnswer", answer, offerInitiator});
    } catch (err) {
      console.log('error receiving offer', err)
    }
  }

  handleReceivedAnswer = async ({fromSocket, answer}) => {
    const peerConnection = getPeer(fromSocket);
    await peerConnection.setRemoteDescription(new this._wrtc.RTCSessionDescription(answer)); 
  } 

  addCandidate = async ({candidate, fromSocket}) => { 
    try {
      const peerConnection = getPeer(fromSocket);
      console.log(fromSocket, peerConnection)
      await peerConnection.addIceCandidate(candidate); 
    } catch (e) {
      console.log('error adding received ice candidate', e)
    }
  }

  handleError = (e) => {
    console.log('error', e)
  }

  handlePeerLeave = ({leavingUser}) => {
    getPeer(leavingUser).close();
    console.log(`${leavingUser} left`);
  }

  handleLeave = () => {
    Object.values(store.peers).forEach(peerConnection => {
      peerConnection.close();
      peerConnection.onicecandidate = null;
    })
  }

  send = (data) => {
    this.socket.emit(data.type, {
      ...data, 
      fromSocket: this.socket.id,
      fromName: store.get('name')
    });
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
}
