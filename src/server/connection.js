import socketIO from 'socket.io';

export default class SocketConnection {
  constructor(server) {
    this.io = socketIO(server);
    this.connectedUsers = {};
  }

  connect = () => {
    this.io.on("connection", (socket) => {
      socket.on('message', (message) => {
        this.handleMessage(socket, message);
      });
      socket.on('disconnect', () => this.handleDisconnect(socket));
    })
  }

  handleMessage = (socket, message) => {
    let data; 
    try { 
       data = JSON.parse(message); 
    } catch (e) { 
      console.log("Invalid JSON"); 
      data = {}; 
    } 
    
    switch (data.type) { 
      case "enterRoom": 
        this.handleEnterRoom(socket, data);
        break;
      case "sendOffers": 
        this.handleSendOffers(data);
        break;
      case "sendAnswer":        
        this.handleSendAnswer(data);
        break;     
      case "shareCandidate":       
        this.handleCandidate(data);
        break; 
      default: 
        this.sendConnection(socket, {type: "error", message: "Command not found: " + data.type}); 
        break; 
    }
  }

  handleEnterRoom = (socket, {fromSocket, fromName}) => {
    this.io.sockets.connected[fromSocket]['name'] = fromName;
    this.sendConnection(socket, {type: "enteredRoom", success: true});
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

  handleCandidate = ({fromSocket, candidate}) => {
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
    Boolean(socket) && socket.send(JSON.stringify(message));
  }
}