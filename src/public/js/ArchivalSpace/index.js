import sample from 'lodash/sample';
import RoomMembership from '@js/RoomMembership';

class ArchivalSpace {
  constructor () {
    this.messageRecords = [];
    this.members = new RoomMembership();
  }

  initialize = () => {
    this.fetchArchivedMessages().then(() => {
      this.render();
    });
  };

  attachEvents = () => {

  };

  fetchArchivedMessages = async () => {
    const response = await fetch('/archive', {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    });

    const messageRecords = await response.json(); 
    this.messageRecords = messageRecords;
  }

  appendArchivedMessage = ({messageData}) => {
    const $messageRecordAvatar = this.renderArchivalMessageAvatar(messageData);
    $messageRecordAvatar.appendTo($('#archivalMessagesContainer'));

    const $messageDetails = this.renderArchivalMessageDetails(messageData);
    $messageDetails.appendTo($('#archivalMessagesDetailsContainer'));
  }

  renderArchivalMessageAvatar = (messageRecord) => {
    const {base_color, secondary_colors} = messageRecord;
    
    const $messageRecordAvatar = $('<div class="archival textRecord"></div>');
    $messageRecordAvatar.css({backgroundColor: base_color});
    
    Array.from({length: 25}).forEach(() => {
      const color = sample(secondary_colors);
      const $consentIndicator = $('<div class="consentIndicator" style="display:none"></div>');
      $consentIndicator.css({backgroundColor: color});
      $consentIndicator.appendTo($messageRecordAvatar);
    });
  
    $messageRecordAvatar.mouseenter((e) => {
      $(e.target).closest('.textRecord').find('.consentIndicator').show();
    }).mouseleave(e => {
      $(e.target).closest('.textRecord').find('.consentIndicator').hide();
    });
  
    return $messageRecordAvatar;
  };
  
  renderArchivalMessageDetails = (messageRecord) => {
    const {author, content, participant_names, created_at} = messageRecord;
  
    const $messageDetailsTemplate = $(document.getElementById('archivalMessagesDetailsTemplate').content.cloneNode(true));
    const $messageDetails = $messageDetailsTemplate.find('.archivalMessagesDetails');
    $messageDetails.find('.archivedTimestamp').text(new Date(created_at).toDateString());
    $messageDetails.find('.participantNames').text(`Participants: ${participant_names.join(', ')}`);
    $messageDetails.find('.author').text(author);
    $messageDetails.find('.content').text(content);
  
    return $messageDetails;
  };

  render () {
    this.messageRecords.forEach((messageRecord) => {
      const $messageRecordAvatar = this.renderArchivalMessageAvatar(messageRecord);
      $messageRecordAvatar.appendTo($('#archivalMessagesContainer'));

      const $messageDetails = this.renderArchivalMessageDetails(messageRecord);
      $messageDetails.appendTo($('#archivalMessagesDetailsContainer'));
    });
  }
}

export default ArchivalSpace;