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

  addArchivedMessage = ({messageData}) => {
    const $messageRecordAvatar = this.renderArchivalMessageAvatar(messageData);
    $messageRecordAvatar.appendTo($('#archivalMessagesContainer'));

    const $messageDetails = this.renderArchivalMessageDetails(messageData)
    $messageDetails.appendTo($('#archivalMessagesDetailsContainer'));
  }

  renderArchivalMessageAvatar = (messageRecord) => {
    const {color, secondary_colors} = messageRecord;
    
    const $messageRecordAvatar = $(`<div class="archival textRecord"></div>`);
    $messageRecordAvatar.css({backgroundColor: color});
  
    const participantIndicatorSize = Math.round(50 / (Math.floor(Math.sqrt(secondary_colors.length)) + 1));
    secondary_colors.forEach(secondary_color => {
      const $consentIndicator = $('<div class="consentIndicator" style="display:none"></div>');
      $consentIndicator.css({backgroundColor: secondary_color})
      $consentIndicator.width(participantIndicatorSize);
      $consentIndicator.height(participantIndicatorSize);
      $consentIndicator.appendTo($messageRecordAvatar);
    });
  
    $messageRecordAvatar.mouseenter((e) => {
      $(e.target).find('.consentIndicator').show();
    }).mouseleave(e => {
      $(e.target).find('.consentIndicator').hide();
    });
  
    return $messageRecordAvatar;
  };
  
  renderArchivalMessageDetails = (messageRecord) => {
    const {author, content, participants, created_at} = messageRecord;
  
    const $messageDetailsTemplate = $(document.getElementById('archivalMessagesDetailsTemplate').content.cloneNode(true));
    const $messageDetails = $messageDetailsTemplate.find('.archivalMessagesDetails');
    $messageDetails.find('.archivedTimestamp').text(new Date(created_at).toDateString());
    $messageDetails.find('.participantNames').text(`Participants: ${participants.join(', ')}`);
    $messageDetails.find('.author').text(author);
    $messageDetails.find('.content').text(content);
  
    return $messageDetails;
  };

  render () {
    this.messageRecords.forEach((messageRecord) => {
      const $messageRecordAvatar = this.renderArchivalMessageAvatar(messageRecord);
      $messageRecordAvatar.appendTo($('#archivalMessagesContainer'));

      const $messageDetails = this.renderArchivalMessageDetails(messageRecord)
      $messageDetails.appendTo($('#archivalMessagesDetailsContainer'));
    });
  }
}

const archivalSpace = new ArchivalSpace();

export default archivalSpace;