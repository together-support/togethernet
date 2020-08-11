function MessageTracker(){
  this.state = {};
}
// processes a message and tracks its state
MessageTracker.prototype.addMessage = function(message){
  const {recipient, id} = message;
  if(!(id in this.state)){
    const readState = {
      message,
      expectedRecipients: new Set(),
      actualRecipients: new Set()
    }
    this.state[id] = readState;
  }
  this.state[id].expectedRecipients.add(recipient);
}
//creates read receipts
MessageTracker.prototype.createReceipt = function(message){
  const {id, recipient} = message;
  return {
    type: 'read',
    id,
    recipient
  }
}
MessageTracker.prototype.processReceipt = function(receipt){
  const {id, recipient} = receipt;
  if(id in this.state){
    this.state[receipt.id].actualRecipients.add(recipient)
  }
}
MessageTracker.prototype.getMessageState = function(id){
  return this.state[id];
}
MessageTracker.prototype.getReceivedState = function(id){
  if(!(id in this.state)){
    return undefined
  }
  const {expectedRecipients, actualRecipients} = this.state[id];
  const missedRecipients = [];
  for(let recipient of expectedRecipients){
    if(!actualRecipients.has(recipient)){
      missedRecipients.push(recipient);
    }
  }
  return {
    expectedRecipients,
    actualRecipients,
    missedRecipients
  }
}
MessageTracker.prototype.has = function(id){
  return (id in this.state)
}

module.exports = {
  MessageTracker
}
