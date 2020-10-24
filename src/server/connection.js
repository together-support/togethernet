import socketIO from 'socket.io';

export default class SocketConnection {
  constructor(server) {
    this.io = socketIO(server);
    this.socket = null;
    this.connectedUsers = {};
  }

  connect = () => {
    this.io.on("connection", (socket) => {
      this.socket = socket;
      socket.on('message', this.handleMessage);
      socket.on('disconnect', this.handleConnectionClose);
    })
  }

  handleMessage = (message) => {
    let data; 
    try { 
       data = JSON.parse(message); 
    } catch (e) { 
      console.log("Invalid JSON"); 
      data = {}; 
    } 
    
    switch (data.type) { 
      case "enterRoom": 
        this.handleEnterRoom(data);
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
        this.send({type: "error", message: "Command not found: " + data.type}); 
        break; 
    }
  }

  handleEnterRoom = ({fromSocket, fromName}) => {
    if(this.connectedUsers[fromSocket]) { 
      this.send({type: "enteredRoom", success: false}); 
    } else { 
      this.connectedUsers[fromSocket] = this.socket; 
      this.connectedUsers[fromSocket]['name'] = fromName; 
      this.send({type: "enteredRoom", success: true});
    }
  }

  handleSendOffers = ({offer, fromSocket}) => {
    const peerIds = Object.keys(this.connectedUsers).filter(socketId => socketId !== this.socket.id)
    peerIds.forEach((peerId) => {
      const connection = this.connectedUsers[peerId];
      this.sendConnection(connection, {type: "offer", offer, offerInitiator: fromSocket});    
    })
  }

  handleSendAnswer = ({offerInitiator, answer}) => {
    const connection = this.connectedUsers[offerInitiator];   
    if(Boolean(connection)){ 
      this.sendConnection(connection, {type: "answer", answer}); 
    }
  }

  handleCandidate = ({candidate}) => {
    const peerIds = Object.keys(this.connectedUsers).filter(socketId => socketId !== this.socket.id)

    peerIds.forEach((peerId) => {
      const connection = this.connectedUsers[peerId];
      this.sendConnection(connection, {type: "candidate", candidate}); 
    })
  }

  handleConnectionClose = () => {
    this.send({type: 'leave'});
    const peerIds = Object.keys(this.connectedUsers).filter(socketId => socketId !== this.socket.id)
    peerIds.forEach((peerId) => {
      const connection = this.connectedUsers[peerId];
      this.sendConnection(connection, {type: 'leave', fromSocket: this.socket.id});
    });
    delete this.connectedUsers[this.socket.id]; 
  }

  send = (message) => {
    this.sendConnection(this.socket, message);
  }

  sendConnection = (socket, message) => {
    Boolean(socket) && socket.send(JSON.stringify(message));
  }
}