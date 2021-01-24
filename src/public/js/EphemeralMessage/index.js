import store from '@js/store';
import renderEphemeralDetails from './renderEphemeralDetails'

export default class EphemeralMessage {
  constructor (props) {
    this.messageData = {
      ...props, 
      id: `${props.roomId}-${props.gridColumnStart}-${props.gridRowStart}`,
    };
  }
   
  $textRecord = () => {
    return $(`#${this.messageData.id}`);
  }

  renderEphemeralMessageDetails = () => {
    $('.nonPinnedMessages').empty();

    if (!this.messageData.isPinned) {
      const $messageContent = renderEphemeralDetails(this.messageData);
      $messageContent.appendTo($('.nonPinnedMessages'));
    }

    $('.ephemeralMessageContainer').finish().show();
  }

  purgeSelf = () => {
    if (this.messageData.threadNextMessageId || this.messageData.threadPreviousMessageId) {
      this.handleRemoveMessageInThread();
    } else {
      this.handleRemoveSingleMessage();
    }
  }

  handleRemoveSingleMessage = () => {
    const room = store.getRoom(this.messageData.roomId);
    const $textRecord = this.$textRecord();

    $('.nonPinnedMessages').empty();
    $('.ephemeralMessageContainer').hide();
    $textRecord.finish().animate({opacity: 0}, {
      complete: () => {
        $textRecord.remove();
        store.sendToPeers({
          type: 'removeEphemeralMessage',
          data: {
            messageId: this.messageData.id,
            roomId: this.messageData.roomId,
          }
        });
        room.removeEphemeralHistory(this.messageData.id);
      }
    }); 
  }

  render = () => {
    const $ephemeralRecord = $(
      `<div \
        class="ephemeralRecord" \ 
        id=${this.messageData.id} \
        style="grid-column-start:${this.messageData.gridColumnStart};grid-row-start:${this.messageData.gridRowStart};" \
      />`
    );

    $ephemeralRecord
      .on('mouseenter', this.renderEphemeralMessageDetails)
      .on('mouseleave', () => $('.ephemeralMessageContainer').finish().fadeOut(500));

    $ephemeralRecord.on('adjacent', this.renderEphemeralMessageDetails);

    $ephemeralRecord.css({backgroundColor: this.messageData.avatar});
    $ephemeralRecord.appendTo($(`#${this.messageData.roomId}`));
  }
}