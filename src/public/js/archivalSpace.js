import {archivalMessageAvatar, archivalMessageDetails} from '../components/history.js'

class ArchivalSpace {
  constructor () {
    this.messageRecords = [];
  }

  fetchArchivedMessages = async () => {
    const response = await fetch('/archive', {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });

    const messageRecords = await response.json(); 
    this.messageRecords = messageRecords;
  }

  addArchivedMessage = (messageData) => {
    const $messageRecordAvatar = archivalMessageAvatar(messageData);
    $messageRecordAvatar.appendTo($('#archivalMessagesContainer'));

    const $messageDetails = archivalMessageDetails(messageData)
    $messageDetails.appendTo($('#archivalMessagesDetailsContainer'));
  }

  render () {
    this.messageRecords.forEach((messageRecord) => {
      const $messageRecordAvatar = archivalMessageAvatar(messageRecord);
      $messageRecordAvatar.appendTo($('#archivalMessagesContainer'));

      const $messageDetails = archivalMessageDetails(messageRecord)
      $messageDetails.appendTo($('#archivalMessagesDetailsContainer'));
    });
  }
}

const archivalSpace = new ArchivalSpace();

export default archivalSpace;