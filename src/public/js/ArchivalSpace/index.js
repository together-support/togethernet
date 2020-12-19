import RoomMembership from '@js/RoomMembership';
import ArchivedMessage from '@js/ArchivedMessage';
import store from '@js/store';
import {addSystemMessage} from '@js/Togethernet/systemMessage';

class ArchivalSpace {
  static isEphemeral = false;

  constructor () {
    this.messageRecords = [];
    this.memberships = new RoomMembership('archivalSpace');

    this.editor = null;

    this.$roomLink = $('#archivalSpaceLink');
  }

  initialize = () => {
    this.fetchArchivedMessages().then(() => {
      this.attachEvents();
      this.render();
    });
  };

  attachEvents = () => {
    this.$roomLink.on('click', this.goToRoom)
  };

  goToRoom = () => {
    $('.chat').hide();
    $('#archivalSpace').show();
    if (this.memberships.isEmpty()) {
      this.editor = store.getCurrentUser().socketId;
      addSystemMessage("You have landed in the archival channel and you are currently editing");
    } else {
      const editor = store.getPeer(this.editor);
      addSystemMessage(`You have landed in the archival channel and ${editor.state.name} is currently editing`);
    }
    this.memberships.addMember(store.getCurrentUser());
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