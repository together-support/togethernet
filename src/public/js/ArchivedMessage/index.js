import sample from 'lodash/sample';
import store from '@js/store';

class ArchivedMessage {
  constructor (messageData, index) {
    this.messageData = messageData;
    this.index = index;
  }

  renderMessageRecord = () => {
    const {id, base_color, secondary_colors} = this.messageData;
    
    const $messageRecordAvatar = $('<div class="archival textRecord"></div>');
    $messageRecordAvatar.css({backgroundColor: base_color});
    $messageRecordAvatar.attr('id', `archivedMessageRecord-${id}`);
    
    Array.from({length: 25}).forEach(() => {
      const color = sample(secondary_colors);
      const $consentIndicator = $('<div class="consentIndicator" style="display:none"></div>');
      $consentIndicator.css({backgroundColor: color});
      $consentIndicator.appendTo($messageRecordAvatar);
    });
  
    $messageRecordAvatar.mouseenter((e) => {
      $(e.target).closest('.textRecord').find('.consentIndicator').show();
      document.getElementById(`archivedMessageDetails-${id}`).scrollIntoView({behavior: 'smooth'});
    }).mouseleave(e => {
      $(e.target).closest('.textRecord').find('.consentIndicator').hide();
    });

    $messageRecordAvatar.on('click', this.toggleIsEditing);
  
    return $messageRecordAvatar;
  }

  $messageRecord = () => {
    const {id} = this.messageData;
    return $(`#archivedMessageRecord-${id}`);
  }

  toggleIsEditing = () => {
    const archivalSpace = store.getRoom('archivalSpace');
    if (archivalSpace.isEditingMessageId === this.messageData.id) {
      archivalSpace.isEditingMessageId = null;
    } else {
      $(`#archivedMessageRecord-${archivalSpace.isEditingMessageId}`).removeClass('isEditing');
      archivalSpace.isEditingMessageId = this.messageData.id;
    }
    this.$messageRecord().toggleClass('isEditing');
  }

  renderMessageDetails = () => {
    const {id, author, content, participant_names, created_at} = this.messageData;
  
    const $messageDetailsTemplate = $(document.getElementById('archivalMessagesDetailsTemplate').content.cloneNode(true));
    const $messageDetails = $messageDetailsTemplate.find('.archivalMessagesDetails');
    $messageDetails.attr('id', `archivedMessageDetails-${id}`);
    $messageDetails.find('.archivedTimestamp').text(new Date(created_at).toDateString());
    $messageDetails.find('.participantNames').text(`Participants: ${participant_names.join(', ')}`);
    $messageDetails.find('.content').text(`${this.index}.${content}.${author}`);
  
    return $messageDetails;
  }
}

export default ArchivedMessage;