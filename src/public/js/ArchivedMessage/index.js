import sample from 'lodash/sample';
import store from '@js/store';
import {formatDateTimeString} from '@js/utils';

class ArchivedMessage {
  constructor (props) {
    const {messageData, index} = props
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

  renderArchivedMessage = () => {
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
    $messageDetails.find('.message').text(`${this.index}. ${content}`);
    $messageDetails.find('.author').text(author);
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