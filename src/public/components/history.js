export const archivalMessageAvatar = (messageRecord) => {
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

export const archivalMessageDetails = (messageRecord) => {
  const {author, content, participants, created_at} = messageRecord;

  const $messageDetailsTemplate = $(document.getElementById('archivalMessagesDetailsTemplate').content.cloneNode(true));
  const $messageDetails = $messageDetailsTemplate.find('.archivalMessagesDetails');
  $messageDetails.find('.archivedTimestamp').text(new Date(created_at).toDateString());
  $messageDetails.find('.participantNames').text(`Participants: ${participants.join(', ')}`);
  $messageDetails.find('.author').text(author);
  $messageDetails.find('.content').text(content);

  return $messageDetails;
};