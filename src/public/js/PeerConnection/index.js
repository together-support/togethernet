import io from 'socket.io-client';
import store from '@js/store';
import {getBrowserRTC} from './ensureWebRTC';
import {handleData} from './dataReceiver';
import {addSystemMessage} from '@js/Togethernet/systemMessage';
import archivalSpace from '@js/ArchivalSpace';
import User from '@js/User';

export default class PeerConnection {
  constructor () {
    this._wrtc = getBrowserRTC();
    this.socket = io.connect();
    this.initiator = false;
  }

  connect = () => {
    this.socket.on('connect', () => {
      new User(this.socket.id).initialize();
      
      Object.values(store.get('rooms')).forEach(room => room.attachEvents());
      addSystemMessage('Searching for peers...');
      store.getCurrentRoom().goToRoom();
    });

    this.socket.on('initConnections', this.initConnections);
    this.socket.on('offer', this.handleReceivedOffer);
    this.socket.on('answer', this.handleReceivedAnswer);
    this.socket.on('candidate', this.addCandidate);
    this.socket.on('peerLeave', this.handlePeerLeaveSocket);
    this.socket.on('archivedMessage', archivalSpace.addArchivedMessage);
    this.socket.on('error', this.handleError);
  }

  initConnections = async ({peerId}) => {
    const peerConnection = this.initPeerConnection(peerId, {initiator: true});
    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true
      });
      await peerConnection.setLocalDescription(offer); 
      this.send({type: 'sendOffers', offer, peerId});
    } catch (e) {
      console.log('error creating offer to connect to peers', e); 
    }
  }

  handleReceivedOffer = async ({offer, offerInitiator}) => { 
    try {
      const peerConnection = this.initPeerConnection(offerInitiator, {initiator: false});
      await peerConnection.setRemoteDescription(new this._wrtc.RTCSessionDescription(offer)); 
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer); 
      this.send({type: 'sendAnswer', answer, offerInitiator});
    } catch (err) {
      console.log('error receiving offer', err);
    }
  }

  initPeerConnection = (peerId, {initiator}) => {
    const peerConnection = new this._wrtc.RTCPeerConnection({ 
      'iceServers': [{
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:global.stun.twilio.com:3478',
        ]
      }],
      sdpSemantics: 'unified-plan'
    });

    const peer = store.addPeer(peerId, peerConnection);

    peerConnection.onicecandidate = (event) => { 
      if (event.candidate) { 
        this.send({type: 'trickleCandidate', candidate: new this._wrtc.RTCIceCandidate(event.candidate)}); 
      } 
    };

    if (initiator) {
      const dataChannel = peerConnection.createDataChannel('tn', {reliable: true});
      peer.dataChannel = this.setUpDataChannel({dataChannel, peerId, initiator});
    } else {
      peerConnection.ondatachannel = (event) => {
        peer.dataChannel = this.setUpDataChannel({dataChannel: event.channel, peerId});
      };
    }

    return peerConnection;
  }

  setUpDataChannel = ({dataChannel, peerId, initiator}) => {
    dataChannel.onclose = () => {
      console.log('channel close'); 
    };

    dataChannel.onmessage = (event) => {
      handleData({event, peerId});
    };

    dataChannel.onopen = () => {
      addSystemMessage('Peer connection established. You\'re now ready to chat in the p2p mode');
      store.sendToPeer(dataChannel, {
        type: 'initPeer', 
        data: {
          room: store.getCurrentRoom(),
          ...$('#user').position(),
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
    
    return dataChannel;
  }

  handleReceivedAnswer = async ({fromSocket, answer}) => {
    await store.getPeer(fromSocket).peerConnection.setRemoteDescription(new this._wrtc.RTCSessionDescription(answer)); 
  } 

  addCandidate = async ({candidate, fromSocket}) => { 
    try {
      await store.getPeer(fromSocket).peerConnection.addIceCandidate(candidate); 
    } catch (e) {
      console.log('error adding received ice candidate', e);
    }
  }

  handleError = () => {
    this.socket.disconnect();
  }

  handlePeerLeaveSocket = ({leavingUser}) => {
    $(`#peer-${leavingUser}`).finish().animate({opacity: 0}, {
      complete: () => {
        $(`#peer-${leavingUser}`).remove();
        $(`#participant-${leavingUser}`).animate({opacity: 0}, {
          complete: () => $(`#participant-${leavingUser}`).remove()
        });
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
