function MessageTracker(){
  this.state = {};
}
MessageTracker.prototype.addMessage = function(message, expectedRecipients){
  const readState = {
    message,
    expectedRecipients,
    actualRecipients: 0
  }
  this.state[message.id] = readState;
}
MessageTracker.prototype.createReceipt = function(message){
  return {
    id: message.id,
    type: 'read'
  }
}
MessageTracker.prototype.processReceipt = function(receipt){
  if(receipt.id in this.state){
    this.state[receipt.id].actualRecipients++;
  }
}
MessageTracker.prototype.getMessageState = function(id){
  return this.state[id];
}
MessageTracker.prototype.has = function(id){
  return (id in this.state)
}

module.exports = {
  MessageTracker
}
