import io from 'socket.io-client';
import {addPeer, getPeer, setDataChannel} from '../store/actions.js'
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
    const peerConnection = this.initPeerConnection(peer, {initiator: true});
    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true
      });
      await peerConnection.setLocalDescription(offer); 
      this.send({type: "sendOffers", offer});
    } catch (e) {
      console.log("error creating offer to connect to peers", e); 
    }
  }

  handleReceivedOffer = async ({offer, offerInitiator}) => { 
    try {
      const peerConnection = this.initPeerConnection(offerInitiator, {initiator: false});
      await peerConnection.setRemoteDescription(new this._wrtc.RTCSessionDescription(offer)); 
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer); 
      this.send({type: "sendAnswer", answer, offerInitiator});
    } catch (err) {
      console.log('error receiving offer', err)
    }
  }

  initPeerConnection = (peerId, {initiator}) => {
    const peerConnection = new this._wrtc.RTCPeerConnection({ 
      "iceServers": [{
        url: 'stun:stun.l.google.com:19302'
      }],
      sdpSemantics: 'unified-plan'
    });

    addPeer(peerId, peerConnection);

    peerConnection.onicecandidate = (event) => { 
      if (Boolean(event.candidate)) { 
        this.send({type: "trickleCandidate", candidate: new this._wrtc.RTCIceCandidate(event.candidate)}); 
      } 
    };

    if (initiator) {
      const dataChannel = peerConnection.createDataChannel(store.get('room'), { 
        reliable: true,
      });

      dataChannel.onerror = function (error) { 
        console.log("Error:", error); 
      };
    
      dataChannel.onmessage = function (event) { 
        console.log("Got message:", event.data); 
      };
    } else {
      peerConnection.ondatachannel = (event) => {
        setDataChannel(peerId, event.channel);
      }
    }

    return peerConnection
  }

  handleReceivedAnswer = async ({fromSocket, answer}) => {
    const peerConnection = getPeer(fromSocket);
    console.log('answer from socket', fromSocket)
    await peerConnection.setRemoteDescription(new this._wrtc.RTCSessionDescription(answer)); 
  } 

  addCandidate = async ({candidate, fromSocket}) => { 
    try {
      const peerConnection = getPeer(fromSocket);
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
}
