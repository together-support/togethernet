import socketIO from 'socket.io';

export default class SocketConnection {
  constructor(server) {
    this.io = socketIO(server);
    this.connectedUsers = {};
  }

  connect = () => {
    this.io.on('connection', (socket) => {
      socket.on('enterRoom', this.handleEnterRoom);
      socket.on('sendOffers', this.handleSendOffers);
      socket.on('sendAnswer', this.handleSendAnswer);
      socket.on('trickleCandidate', this.handleTrickleCandidate);
      socket.on('disconnect', () => this.handleDisconnect(socket));
    })
  }

  handleEnterRoom = ({fromSocket, fromName}) => {
    const connection = this.io.sockets.connected[fromSocket];
    connection['name'] = fromName;
    this.sendConnection(connection, {type: "enteredRoom", success: true});
  }

  handleSendOffers = ({offer, fromSocket}) => {
    const peerIds = Object.keys(this.io.sockets.connected).filter(socketId => socketId !== fromSocket);
    peerIds.forEach((peerId) => {
      const connection = this.io.sockets.connected[peerId];
      this.sendConnection(connection, {type: "offer", offer, offerInitiator: fromSocket});    
    })
  }

  handleSendAnswer = ({offerInitiator, answer}) => {
    const connection = this.io.sockets.connected[offerInitiator];   
    if(Boolean(connection)){ 
      this.sendConnection(connection, {type: "answer", answer}); 
    }
  }

  handleTrickleCandidate = ({fromSocket, candidate}) => {
    const peerIds = Object.keys(this.io.sockets.connected).filter(socketId => socketId !== fromSocket)

    peerIds.forEach((peerId) => {
      const connection = this.io.sockets.connected[peerId];
      this.sendConnection(connection, {type: "candidate", candidate}); 
    })
  }

  handleDisconnect = ({id: leavingUser}) => {
    const peerIds = Object.keys(this.io.sockets.connected).filter(socketId => socketId !== leavingUser)

    peerIds.forEach((peerId) => {
      const connection = this.io.sockets.connected[peerId];
      this.sendConnection(connection, {type: "leave", leavingUser}); 
    })
  }

  sendConnection = (socket, message) => {
    Boolean(socket) && socket.emit(message.type, message);
  }
}