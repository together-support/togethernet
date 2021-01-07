import socketIO from 'socket.io';

export default class SignalingServer {
  constructor(server) {
    this.io = socketIO(server);
    this.connectedUsers = {};
  }

  connect = () => {
    this.io.on('connection', (socket) => {      
      // console.log('server connection initiated', new Date().toLocaleTimeString())
      if (Object.keys(this.io.sockets.connected).length > (process.env.CONNECTION_LIMIT || 10)) {
        socket.disconnect();
      }
      
      this.initConnections(socket);

      socket.on('sendOffers', this.handleSendOffers);
      socket.on('sendAnswer', (message) => {
        this.handleSendAnswer(socket, message);
      });
      socket.on('trickleCandidate', this.handleTrickleCandidate);
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  initConnections = (initiator) => {
    const peerIds = Object.keys(this.io.sockets.connected).filter(socketId => socketId !== initiator.id);
    peerIds.forEach((peerId) => {
      this.sendConnection(initiator, {type: 'initConnections', initiator: initiator.id, peerId});    
    });
  }

  alertArchivedMessage = (messageData) => {
    Object.keys(this.io.sockets.connected).forEach((socketId) => {
      const connection = this.io.sockets.connected[socketId];
      this.sendConnection(connection, {type: 'archivedMessage', messageData});    
    });
  }

  alertArchivedMessageUpdated = (messageData) => {
    Object.keys(this.io.sockets.connected).forEach((socketId) => {
      const connection = this.io.sockets.connected[socketId];
      this.sendConnection(connection, {type: 'archivedMessageUpdated', messageData});    
    });
  }
  
  handleSendOffers = ({offer, peerId, fromSocket}) => {
    const connection = this.io.sockets.connected[peerId];
    this.sendConnection(connection, {type: 'offer', offer, offerInitiator: fromSocket});    
  }

  handleSendAnswer = (socket, {offerInitiator, answer}) => {
    const connection = this.io.sockets.connected[offerInitiator];   
    if(connection){ 
      this.sendConnection(connection, {type: 'answer', answer, fromSocket: socket.id}); 
    }
  }

  handleTrickleCandidate = ({fromSocket, candidate}) => {
    const peerIds = Object.keys(this.io.sockets.connected).filter(socketId => socketId !== fromSocket);

    peerIds.forEach((peerId) => {
      const connection = this.io.sockets.connected[peerId];
      this.sendConnection(connection, {type: 'candidate', candidate, fromSocket}); 
    });
  }

  handleDisconnect = ({id: leavingUser}) => {
    // console.log('server disconnected', new Date().toLocaleTimeString())
    const peerIds = Object.keys(this.io.sockets.connected).filter(socketId => socketId !== leavingUser);

    peerIds.forEach((peerId) => {
      const connection = this.io.sockets.connected[peerId];
      this.sendConnection(connection, {type: 'peerLeave', leavingUser}); 
    });
  }

  sendConnection = (socket, message) => {
    Boolean(socket) && socket.emit(message.type, message);
  }
}