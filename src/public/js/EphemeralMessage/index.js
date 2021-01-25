import store from '@js/store';
import ephemeralMessageRenderer from '@js/ephemeralMessageRenderer';
import isPlainObject from 'lodash/isPlainObject';

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
    const {isPinned, id, roomId} = this.messageData;

    if (!isPinned) {
      const $messageContent = ephemeralMessageRenderer.renderMessageDetails(roomId, id);
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

  castVote = (option) => {
    const {votingRecords, id} = this.messageData;
    const myId = store.getCurrentUser().socketId;
    const myCurrentVote = isPlainObject(votingRecords) && votingRecords[myId];
    const data = {textRecordId: id, option, ...store.getCurrentUser().getProfile()};

    if (myCurrentVote) {
      if (myCurrentVote === option) {
        store.sendToPeers({type: 'voteRetracted', data});
        this.voteRetracted(data);
      } else {
        store.sendToPeers({type: 'voteChanged', data});
        this.voteChanged(data);
      }
    } else {
      store.sendToPeers({type: 'voteCasted', data});
      this.voteReceived(data);
    }
  }

  voteReceived = ({option, socketId}) => {
    const {votes = {}, votingRecords, id} = this.messageData;
    this.messageData.votes = {
      ...votes, 
      [option]: (isNaN(votes[option]) ? 1 : votes[option] + 1),
    };
    this.messageData.votingRecords = {
      ...votingRecords,
      [socketId]: option,
    };

    $(`#ephemeralDetails-${id} .voteOption.${option} .voteCount`)
      .text(this.messageData.votes[option]);
  }
  
  voteRetracted = ({option, socketId}) => {
    const {votes = {}, id} = this.messageData;
    this.messageData.votes = {
      ...votes, 
      [option]: (isNaN(votes[option]) ? 1 : votes[option] - 1),
    };

    if (isPlainObject(delete this.messageData.votingRecords)) {
      delete this.messageData.votingRecords[socketId];
    }

    $(`#ephemeralDetails-${id} .voteOption.${option} .voteCount`)
      .text(this.messageData.votes[option]);
  }
  
  voteChanged = ({option, socketId}) => {
    const currentVote = this.messageData.votingRecords[socketId];
    this.voteRetracted({option: currentVote, socketId});
    this.voteReceived({option, socketId});
  }

  createPoll = () => {
    const {roomId, id} = this.messageData;
    this.pollCreated();
    store.sendToPeers({
      type: 'pollCreated',
      data: {roomId, textRecordId: id},
    });
  }

  pollCreated = () => {
    this.messageData.canVote = true;
    this.votes = {
      'yes': 0,
      'no': 0, 
      'neutral': 0
    }
    if ($(`#ephemeralDetails-${this.messageData.id}`).is(":visible")) {
      this.renderEphemeralMessageDetails();
    }
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