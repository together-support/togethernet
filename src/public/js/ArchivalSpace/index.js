import RoomMembership from '@js/RoomMembership';
import ArchivedMessage from '@js/ArchivedMessage';

class ArchivalSpace {
  constructor () {
    this.messageRecords = [];
    this.memberships = new RoomMembership();
  }

  initialize = () => {
    this.fetchArchivedMessages().then(() => {
      this.attachEvents();
      this.render();
    });
  };

  attachEvents = () => {
    $('#archivalSpaceLink').on('click', this.goToRoom)
  };

  goToRoom = () => {
    $('.chat').hide();
    $('#archivalSpace').show();
  }

  fetchArchivedMessages = async () => {
    const response = await fetch('/archive', {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    });

    const messageRecords = await response.json(); 
    this.messageRecords = messageRecords;
  }

  appendArchivedMessage = ({messageData}) => {
    const message = new ArchivedMessage(messageData)
    message.renderMessageRecord().appendTo($('#archivalMessagesContainer'));
    message.renderMessageDetails().appendTo($('#archivalMessagesDetailsContainer'));
  }

  render = () => {
    this.messageRecords.forEach((messageData) => this.appendArchivedMessage({messageData}));
  }
}

export default ArchivalSpace;