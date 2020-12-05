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

  render () {
    this.messageRecords.forEach((messageRecord) => {
      const {color, secondarycolors, author, content, participants, created_at} = messageRecord;
      const $messageRecordAvatar = $(`<div class="archival textRecord"></div>`);
      $messageRecordAvatar.css({backgroundColor: color});

      const participantIndicatorSize = Math.round(50 / (Math.floor(Math.sqrt(secondarycolors.length)) + 1));
      secondarycolors.forEach(secondarycolor => {
        const $consentIndicator = $('<div class="consentIndicator" style="display:none"></div>');
        $consentIndicator.css({backgroundColor: secondarycolor})
        $consentIndicator.width(participantIndicatorSize);
        $consentIndicator.height(participantIndicatorSize);
        $consentIndicator.appendTo($messageRecordAvatar);
      });

      $messageRecordAvatar.mouseenter((e) => {
        $(e.target).find('.consentIndicator').show();
      }).mouseleave(e => {
        $(e.target).find('.consentIndicator').hide();
      });
  
      $messageRecordAvatar.appendTo($('#archivalMessagesContainer'));

      const $messageDetailsTemplate = $(document.getElementById('archivalMessagesDetailsTemplate').content.cloneNode(true));
      const $messageDetails = $messageDetailsTemplate.find('.archivalMessagesDetails');
      $messageDetails.find('.archivedTimestamp').text(new Date(created_at).toDateString())
      $messageDetails.find('.participantNames').text(`Participants: ${participants.join(', ')}`)
      $messageDetails.find('.author').text(author)
      $messageDetails.find('.content').text(content)
      $messageDetails.appendTo($('#archivalMessagesDetailsContainer'));
    });
  }
}

export default ArchivalSpace;