import store from '../../store/index.js';
import {roomModes} from '../../constants/index.js';
import {AgendaTextRecord, DisappearingTextRecord, PersistentTextRecord, ThreadedTextRecord} from './ephemeralMessageRecords/index.js';

const messageTypeToComponent = {
  'question': PersistentTextRecord,
  'idea': PersistentTextRecord,
  'message': DisappearingTextRecord,
  'agenda': AgendaTextRecord,
  'threadedMessage': ThreadedTextRecord,
};

export default class EphemeralMessageRecord {
  constructor (props) {
    const messageData = {
      ...props,
      id: `${props.roomId}-${props.left}-${props.top}`,
      votingRecords: props.votingRecords || {},
      threadNextMessageId: '',
    };

    const room = store.getRoom(props.roomId);
    if (room.ephemeral && room.mode === roomModes.directAction) {
      messageData.votes = props.votes || {
        agree: 0,
        disagree: 0,
        stand: 0,
        block: 0,
      };
    }

    this.messageData = messageData;
  }
   
  $textRecord = () => {
    return $(`#${this.messageData.id}`);
  }

  renderVotingButtons = (template, votes) => {
    const $votingButtons = $(document.getElementById(`${template}Template`).content.cloneNode(true));
    $votingButtons.find('.votingButtons').children().each((_, el) => {
      const option = $(el).data('value');
      $(el).find('.voteCount').text(votes[option]);
      $(el).on('click', this.castVote);
    });
  
    return $votingButtons;
  }

  updateMessageData = (newState) => {
    this.messageData = {
      ...this.messageData,
      ...newState
    };
  }

  castVote = (e) => {
    const $option = $(e.target).closest('.voteOption');
    const option = $option.data('value');

    const myProfile = store.getCurrentUser().getProfile();
    const myCurrentVote = this.messageData.votingRecords[myProfile.socketId];
    const data = {textRecordId: this.messageData.id, option, ...myProfile};
  
    if (myCurrentVote) {
      if (myCurrentVote === option) {
        store.sendToPeers({type: 'voteRetracted', data});
        this.voteRetracted(data);
        $option.removeClass('myVote');
      } else {
        store.sendToPeers({type: 'voteChanged', data});
        this.voteChanged(data);
        $option.closest('.votingButtons').find(`.voteOption[data-value="${myCurrentVote}"]`).removeClass('myVote');
        $option.addClass('myVote');
      }
    } else {
      store.sendToPeers({type: 'voteCasted', data});
      this.voteReceived(data);
      $option.addClass('myVote');
    }
  }

  voteReceived = ({option, socketId}) => {
    this.messageData.votes[option] += 1;
    this.messageData.votingRecords[socketId] = option;
    $(`#${this.messageData.id}`)
      .find(`.voteOption[data-value="${option}"]`)
      .find('span')
      .text(this.messageData.votes[option]);
  }
  
  voteRetracted = ({option, socketId}) => {  
    this.messageData.votes[option] -= 1;
    delete this.messageData.votingRecords[socketId];
    $(`#${this.messageData.id}`)
      .find(`.voteOption[data-value="${option}"]`)
      .find('.voteCount')
      .text(this.messageData.votes[option]);
  }
  
  voteChanged = ({option, socketId}) => {
    const currentVote = this.messageData.votingRecords[socketId];
    this.voteRetracted({option: currentVote, socketId});
    this.voteReceived({option, socketId});
  }

  getBaseTextRecord = () => {
    const {id, left, top, avatar, messageType, votes, name, message, roomId} = this.messageData;

    const room = store.getRoom(roomId);
    const $textRecordTemplate = $(document.getElementById('textRecordTemplate').content.cloneNode(true));
    const $textRecord = $textRecordTemplate.find('.textRecord');
    const $textBubble = $textRecord.find('.textBubble');

    $textRecord.attr('id', id);
    $textRecord.css({left, top, backgroundColor: avatar});

    $textBubble.addClass(messageType);
    $textBubble.attr('id', `textBubble-${id}`);

    $textBubble.find('.textContentContainer').attr('id', `textMessageContent-${id}`);
    $textBubble.find('.name').text(name);
    $textBubble.find('.content').text(message);


    if (this.messageData.socketId === store.getCurrentUser().socketId) {
      const $closeButton = $('<button class="close icon">x</button>');
      $closeButton.on('click', this.purgeSelf);
      $closeButton.appendTo($textBubble.find('.textBubbleButtons'));
    }

    if (room.mode === roomModes.directAction) {
      this.renderVotingButtons('consentfulGestures', votes).appendTo($textBubble);
    }

    return $textRecord;
  }

  getThreadHeadId = () => {
    const {roomId, threadPreviousMessageId} = this.messageData;
    if (!threadPreviousMessageId) {
      return this.messageData.id
    }

    const ephemeralHistory = store.getRoom(roomId).ephemeralHistory;
    let threadPreviousMessage = ephemeralHistory[threadPreviousMessageId];
    while (Boolean(threadPreviousMessage.messageData.threadPreviousMessageId)) {
      threadPreviousMessage = ephemeralHistory[threadPreviousMessage.messageData.threadPreviousMessageId];
    }

    return threadPreviousMessage.messageData.id;
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

  handleRemoveMessageInThread = () => {
    $(`#textMessageContent-${this.messageData.id}`).text('[removed]')
  
    store.sendToPeers({
      type: 'removeMessageInThread',
      data: {messageId: this.messageData.id}
    });
  }
 
  pollCreated = () => {
    this.messageData.isPoll = true;
    this.messageData.votes = {yes: 0, neutral: 0, no: 0};
    const $textBubble = this.$textRecord().find('.textBubble');
    $textBubble.addClass('poll');
    this.renderVotingButtons('majorityRules', this.messageData.votes).appendTo($textBubble);
  }

  render = () => {
    const recordType = messageTypeToComponent[this.messageData.messageType];
    
    new recordType({
      ...this.messageData,
      getThreadHeadId: this.getThreadHeadId,
      getBaseTextRecord: this.getBaseTextRecord,
      renderVotingButtons: this.renderVotingButtons,
      pollCreated: this.pollCreated,
    }).render();
  }
}