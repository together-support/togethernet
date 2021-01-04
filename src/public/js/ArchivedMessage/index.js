import sample from 'lodash/sample';
import store from '@js/store';
import {formatDateTimeString} from '@js/utils';

class ArchivedMessage {
  constructor (messageData, index) {
    this.messageData = messageData;
    this.index = index;
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

  renderMessageRecord = () => {
    if (this.messageData.message_type === 'text_message') {
      return this.renderMessageRecordForTextMessage();
    } else if (this.messageData.message_type === 'comment') {
      return this.renderMessageRecordForComment();
    }
  }

  renderBaseRecord = () => {
    const {id, base_color} = this.messageData;
    
    const $messageRecordAvatar = $('<div class="archival textRecord"></div>');
    $messageRecordAvatar.css({backgroundColor: base_color});
    $messageRecordAvatar.attr('id', `archivedMessageRecord-${id}`);
    
    $messageRecordAvatar.mouseenter((e) => {
      $(e.target).closest('.textRecord').find('.consentIndicator').show();
      document.getElementById(`archivedMessageDetails-${id}`).scrollIntoView({behavior: 'smooth'});
    }).mouseleave(e => {
      $(e.target).closest('.textRecord').find('.consentIndicator').hide();
    });

    $messageRecordAvatar.on('click', this.toggleIsEditing);
  
    return $messageRecordAvatar;
  }

  renderMessageRecordForTextMessage = () => {
    const {secondary_colors} = this.messageData;

    const $messageRecord = this.renderBaseRecord();
    Array.from({length: 25}).forEach(() => {
      const color = sample(secondary_colors);
      const $consentIndicator = $('<div class="consentIndicator" style="display:none"></div>');
      $consentIndicator.css({backgroundColor: color});
      $consentIndicator.appendTo($messageRecord);
    });

    return $messageRecord;
  }

  renderMessageRecordForComment = () => {
    const $messageRecord = this.renderBaseRecord();
    $messageRecord.addClass('comment');
    $messageRecord.html('<i class="fas fa-comment"></i>');
    return $messageRecord;
  }

  renderMessageDetails = () => {
    if (this.messageData.message_type === 'text_message') {
      return this.renderMessageDetailsForTextRecord();
    } else if (this.messageData.message_type === 'comment') {
      return this.renderMessageDetailsForComment();
    }
  }

  renderBaseDetails = () => {
    const {id} = this.messageData;
  
    const $messageDetailsTemplate = $(document.getElementById('archivalMessagesDetailsTemplate').content.cloneNode(true));
    const $messageDetails = $messageDetailsTemplate.find('.archivalMessagesDetails');
    $messageDetails.attr('id', `archivedMessageDetails-${id}`);
  
    return $messageDetails;
  }

  renderMessageDetailsForTextRecord = () => {
    const {participant_names, content, author} = this.messageData;

    const $messageDetails = this.renderBaseDetails();
    $messageDetails.find('.participantNames').text(`Participants: ${participant_names.join(', ')}`);
    $messageDetails.find('.content').text(`${this.index}.${content}.${author}`);
    return $messageDetails;
  }

  renderMessageDetailsForComment = () => {
    const {author, content, created_at} = this.messageData;
    const $messageDetails = this.renderBaseDetails();
    $messageDetails.find('.content').text(`${this.index}.${content}. Annotated by ${author}. ${formatDateTimeString(created_at)}`);

    return $messageDetails;
  }
}

export default ArchivedMessage;