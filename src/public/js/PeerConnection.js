import io from 'socket.io-client';
import store from '../store/index.js';
import {getBrowserRTC} from './ensureWebRTC.js'
import {handleData} from './dataReceiver.js';
import {addSystemMessage} from './systemMessage.js';

export default class PeerConnection {
  constructor () {
    this._wrtc = getBrowserRTC();
    this.socket = io.connect();
    this.initiator = false;
  }

  connect = () => {
    this.socket.on('connect', () => {
      store.set('socketId', this.socket.id);
      Object.values(store.get('rooms')).forEach(room => room.attachEvents());
      store.getCurrentRoom().goToRoom();
      addSystemMessage('Searching for peers...');
    });
    this.socket.on('initConnections', this.initConnections)
    this.socket.on('offer', this.handleReceivedOffer);
    this.socket.on('answer', this.handleReceivedAnswer);
    this.socket.on('candidate', this.addCandidate);
    this.socket.on('peerLeave', this.handlePeerLeaveSocket);
    this.socket.on('error', this.handleError);
  }

  initConnections = async ({peerId}) => {
    const peerConnection = this.initPeerConnection(peerId, {initiator: true});
    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true
      });
      await peerConnection.setLocalDescription(offer); 
      this.send({type: "sendOffers", offer, peerId});
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

    store.addPeer(peerId, peerConnection);

    peerConnection.onicecandidate = (event) => { 
      if (Boolean(event.candidate)) { 
        this.send({type: "trickleCandidate", candidate: new this._wrtc.RTCIceCandidate(event.candidate)}); 
      } 
    };

    if (initiator) {
      const dataChannel = peerConnection.createDataChannel('tn', {reliable: true});
      peerConnection.dataChannel = this.setUpDataChannel({dataChannel, peerId, initiator});
    } else {
      peerConnection.ondatachannel = (event) => {
        store.setDataChannel(peerId, this.setUpDataChannel({dataChannel: event.channel, peerId}));
      }
    }

    return peerConnection
  }

  setUpDataChannel = ({dataChannel, peerId, initiator}) => {
    dataChannel.onclose = () => {
      console.log("channel close"); 
    };

    dataChannel.onmessage = (event) => {
      handleData({event, peerId});
    };

    dataChannel.onopen = () => {
      addSystemMessage("Peer connection established. You're now ready to chat in the p2p mode");
      store.sendToPeer(dataChannel, {
        type: 'initPeer', 
        data: {
          room: store.getCurrentRoom(),
          x: $('#user').position().left,
          y: $('#user').position().top,
        },
      });
      
      if (initiator && store.get('needRoomsInfo')) {
        store.sendToPeer(dataChannel, {type: 'requestRooms'});
      }
    };

    dataChannel.onerror = (event) => {
      dataChannel.close();
      addSystemMessage(event.error.message);
    };
    
    return dataChannel
  }

  handleReceivedAnswer = async ({fromSocket, answer}) => {
    const peerConnection = store.getPeer(fromSocket);
    await peerConnection.setRemoteDescription(new this._wrtc.RTCSessionDescription(answer)); 
  } 

  addCandidate = async ({candidate, fromSocket}) => { 
    try {
      const peerConnection = store.getPeer(fromSocket);
      await peerConnection.addIceCandidate(candidate); 
    } catch (e) {
      console.log('error adding received ice candidate', e)
    }
  }

  handleError = (e) => {
    this.socket.disconnect();
  }

  handlePeerLeaveSocket = ({leavingUser}) => {
    const peerConnection = store.getPeer(leavingUser);
    peerConnection.dataChannel.close();
    $(`#peer-${leavingUser}`).finish().animate({opacity: 0}, {
      complete: () => {
        $(`#peer-${leavingUser}`).remove();
        store.removePeer(leavingUser);
      }
    });
  }

  send = (data) => {
    this.socket.emit(data.type, {
      ...data, 
      fromSocket: this.socket.id,
    });
  }
}
