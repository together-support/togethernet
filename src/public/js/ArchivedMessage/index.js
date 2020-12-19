import sample from 'lodash/sample';

class ArchivedMessage {
  constructor (messageData) {
    this.messageData = messageData
  }

  renderMessageRecord = () => {
    const {base_color, secondary_colors} = this.messageData;
    
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
  }

  renderMessageDetails = () => {
    const {author, content, participant_names, created_at} = this.messageData;
  
    const $messageDetailsTemplate = $(document.getElementById('archivalMessagesDetailsTemplate').content.cloneNode(true));
    const $messageDetails = $messageDetailsTemplate.find('.archivalMessagesDetails');
    $messageDetails.find('.archivedTimestamp').text(new Date(created_at).toDateString());
    $messageDetails.find('.participantNames').text(`Participants: ${participant_names.join(', ')}`);
    $messageDetails.find('.author').text(author);
    $messageDetails.find('.content').text(content);
  
    return $messageDetails;
  }
}

export default ArchivedMessage;