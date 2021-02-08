import store from '@js/store';
import {formatDateTimeString} from '@js/utils';
import {updateMessage} from '@js/api';
import moment from 'moment';

class ArchivedMessage {
  constructor (props) {
    const {messageData, index} = props;
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
    } else if (this.messageData.message_type === 'thread') {
      return this.renderMessageDetailsForThread();
    }
  }

  renderBaseDetails = () => {
    const {id} = this.messageData;
  
    const $messageDetailsTemplate = $(document.getElementById('archivalMessagesDetailsTemplate').content.cloneNode(true));
    const $messageDetails = $messageDetailsTemplate.find('.archivalMessagesDetails');
    $messageDetails.attr('id', `archivedMessageDetails-${id}`);

    $messageDetails.find('.deleteArchivedMessage').on('click', this.markMessageDeleted);
    $messageDetails.find('.commentArchivedMessage').on('click', () => {
      if (store.getCurrentRoom().editor !== store.getCurrentUser().socketId) {
        return;
      }

      if (store.getCurrentRoom().isCommentingOnId) {
        $messageDetails.find('.commentArchivedMessage').removeClass('clicked');
        store.getCurrentRoom().isCommentingOnId = null;
        $('#writeMessage').attr('disabled', 'disabled');
      } else {
        $messageDetails.find('.commentArchivedMessage').addClass('clicked');
        store.getCurrentRoom().isCommentingOnId = id;
        $('#writeMessage').removeAttr('disabled');
      }
    });
    $messageDetails
      .on('mouseenter', () => {
        if (!store.getCurrentRoom().isCommentingOnId) {
          if (store.getCurrentRoom().editor === store.getCurrentUser().socketId) {
            $messageDetails.find('.archivalMessageActions').show();
          }
          $messageDetails.addClass('hovered');
        }
      }).on('mouseleave', () => {
        if (!store.getCurrentRoom().isCommentingOnId) {
          $messageDetails.find('.archivalMessageActions').hide();
          $messageDetails.removeClass('hovered');
        }
      });
  
    return $messageDetails;
  }

  markMessageDeleted = () => {
    if (store.getCurrentUser().socketId === store.getRoom('archivalSpace').editor) {
      const content = `message deleted by ${store.getCurrentUser().getProfile().name}. ${moment().format('MMMM D h:mm')}`;
      updateMessage({
        messageId: this.messageData.id,
        content
      });
    }
  }

  renderMessageDetailsForTextRecord = () => {
    const {participant_names, content, author} = this.messageData;

    const $messageDetails = this.renderBaseDetails();
    $messageDetails.find('.participantNames').text(`Participants: ${participant_names.join(', ')}`);
    $messageDetails.find('.index').text(this.index);
    $messageDetails.find('.message').text(`. ${content}`);
    $messageDetails.find('.author').text(author);
    return $messageDetails;
  }

  renderMessageDetailsForComment = () => {
    const {author, content, created_at} = this.messageData;
    const $messageDetails = this.renderBaseDetails();
    $messageDetails.addClass('comment');
    $messageDetails.find('.index').text(this.index);
    $messageDetails.find('.message').text(`. ${content}. Annotated by ${author}. ${formatDateTimeString(created_at)}`);
    $messageDetails.find('.archivalMessageActions').remove();
    return $messageDetails;
  }

  renderMessageDetailsForThread = () => {
    const {author, content, thread_data} = this.messageData;
    const $messageDetails = this.renderBaseDetails();
    $messageDetails.find('.index').text(`${this.index} .`);
    if (thread_data && Object.keys(thread_data).length) {
      $messageDetails.find('.message').text('Thread: ');      
      
      const threadHead = Object.keys(thread_data).find(threadItemId => !thread_data[threadItemId].threadPreviousMessageId);
      let nextMessageId = threadHead;
      while(nextMessageId) {
        const {content, name, threadNextMessageId} = thread_data[nextMessageId];
        const $contentContainerClone = $(document.getElementById('archivedThreadDetailsTemplate').content.cloneNode(true));
        $contentContainerClone.find('.message').text(`${content}.`);
        $contentContainerClone.find('.author').text(name);
        $contentContainerClone.appendTo($messageDetails);
        nextMessageId = threadNextMessageId;
      }
    } else {
      $messageDetails.find('.index').text(this.index);
      $messageDetails.find('.message').text(`. ${content}`);
      $messageDetails.find('.author').text(author);
    }
    return $messageDetails;
  }
}

export default ArchivedMessage;