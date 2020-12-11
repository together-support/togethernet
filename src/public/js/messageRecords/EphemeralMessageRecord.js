import store from '../../store/index.js';
import {roomModes} from '../../constants/index.js';
import {AgendaTextRecord, DisappearingTextRecord, PersistentTextRecord, ThreadedTextRecord} from './ephemeralMessageRecords/index.js';
import {addSystemMessage} from '../systemMessage.js';
import sample from 'lodash/sample';

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
      consentToArchiveRecords: props.consentToArchiveRecords || {},
      consentToArchiveInitiator: '',
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

    if (props.messageType === 'threadedMessage' && (!props.threadPreviousMessageId) && (!props.threadNextMessageId)) {
      const entryMessage = room.ephemeralHistory[props.threadEntryMessageId];
      const threadTail = entryMessage.getThreadTail()
      threadTail.messageData.threadNextMessageId = messageData.id;
      messageData.threadPreviousMessageId = threadTail.messageData.id;
    }

    if (props.inConsentToArchiveProcess) {
      const {consentToArchiveInitiator} = props;
      this.initConsentToArchiveReceived({consentToArchiveInitiator});
    }
  }

  getThreadTail = () => {
    const {roomId, threadNextMessageId} = this.messageData;
    if (!threadNextMessageId) {
      return this;
    };

    const ephemeralHistory = store.getRoom(roomId).ephemeralHistory;
    let threadNextMessage = ephemeralHistory[threadNextMessageId];
    while (Boolean(threadNextMessage.messageData.threadNextMessageId)) {
      threadNextMessage = ephemeralHistory[threadNextMessage.messageData.threadNextMessageId];
    }

    return threadNextMessage;
  }
   
  $textRecord = () => {
    return $(`#${this.messageData.id}`);
  }

  initiateConsentToArchiveProcess = (e) => {
    e.stopPropagation();
    const {roomId, id} = this.messageData;
    addSystemMessage("you have just asked for everyone's consent to archive the message");
    store.sendToPeers({
      type: 'initConsentToArchiveProcess', 
      data: {
        roomId, 
        messageId: id,
      }
    });

    this.performConsentToArchive();
  }

  initConsentToArchiveReceived = ({consentToArchiveInitiator}) => {
    addSystemMessage(`${consentToArchiveInitiator} has just asked for your consent to archive this message. \n\n move your avatar so that it overalps with the message. \n\n enter (y) for YES and (s) for STOP`)
    this.messageData.consentToArchiveInitiator = consentToArchiveInitiator;
    this.performConsentToArchive();
  }

  performConsentToArchive = () => {
    this.messageData.inConsentToArchiveProcess = true;
    const {roomId} = this.messageData;

    this.$textRecord().addClass('inConsentProcess');
    $(`#${roomId}`).find('#user').addClass('inConsentProcess');
    $(`#${roomId}`).find('.consentToArchiveOverlay').show();
    $(`#${roomId}`).off('keyup', this.consentToArchiveActions);
    $(`#${roomId}`).on('keyup', this.consentToArchiveActions);
  }

  consentToArchiveActions = (e) => {
    const {left, top} = $('#user').position();
    const alignedWithMessage = left === this.messageData.left && top === this.messageData.top;
    const alreadyGaveConsent = Boolean(this.messageData.consentToArchiveRecords[store.getCurrentUser().socketId]);
    
    if (alignedWithMessage) {
      if (e.key === 'y') {
        if (!alreadyGaveConsent) {
          this.giveConsentToArchive();
        }
      } else if (e.key === 's') {
        this.blockConsentToArchive()
      }
    }
  }

  giveConsentToArchive = () => {
    this.consentToArchiveReceived(store.getCurrentUser());
    addSystemMessage("You've given your consent to archive this message.\n\nwaiting for peers to give their consent...")

    const {id, roomId} = this.messageData;
    const room = store.getRoom(roomId);

    store.sendToPeers({
      type: 'giveConsentToArchive', 
      data: {
        roomId, 
        messageId: id,
      }
    });

    if (Object.keys(this.messageData.consentToArchiveRecords).length === Object.keys(room.members).length) {
      store.getCurrentUser().sendToServer(this.messageData);
      this.messageArchived();
      store.sendToPeers({
        type: 'messageArchived', 
        data: {
          roomId, 
          messageId: id,
        }
      });
    }
  }

  messageArchived = () => {
    const consentColors = Object.values(this.messageData.consentToArchiveRecords).map(profile => profile.avatar);
    this.$textRecord().find('.consentIndicator').remove();
    Array.from({length: 25}).forEach(_ => {
      const color = sample(consentColors);    
      const $consentIndicator = $('<div class="consentIndicator given"></div>');
      $consentIndicator.css({backgroundColor: color})
      $consentIndicator.appendTo(this.$textRecord());  
    });

    this.finishConsentToArchiveProcess()
  }

  consentToArchiveReceived = (user) => {
    const {socketId, avatar} = user.getProfile();
    if (!this.messageData.consentToArchiveRecords[socketId]) {
      this.messageData.consentToArchiveRecords[socketId] = user.getProfile();
    }

    const size = Math.round(this.$textRecord().outerWidth() / (Math.floor(Math.sqrt(Object.keys(this.messageData.consentToArchiveRecords).length)) + 1));
    const $consentIndicator = $('<div class="consentIndicator"></div>');
    $consentIndicator.css({backgroundColor: avatar});
    $consentIndicator.width(size);
    $consentIndicator.height(size);
    
    this.$textRecord().find('.consentIndicator').each((_, el) => {
      $(el).width(size);
      $(el).height(size);
    });

    $consentIndicator.appendTo(this.$textRecord());
  }

  blockConsentToArchive = () => {
    this.consentToArchiveBlocked();
    addSystemMessage('You have stopped the archive process.');

    const {id, roomId} = this.messageData;
    store.sendToPeers({
      type: 'blockConsentToArchive', 
      data: {
        roomId, 
        messageId: id,
      }
    });
  }

  consentToArchiveBlocked = () => {
    this.$textRecord().find('.consentIndicator').remove();
    this.finishConsentToArchiveProcess();
    this.messageData.consentToArchiveRecords = {};
  }

  finishConsentToArchiveProcess = () => {
    this.messageData.inConsentToArchiveProcess = false;

    const {roomId} = this.messageData;

    this.$textRecord().removeClass('inConsentProcess');
    $(`#${roomId}`).find('#user').removeClass('inConsentProcess');
    $(`#${roomId}`).find('.consentToArchiveOverlay').hide();
    $(`#${roomId}`).off('keyup', this.consentToArchiveActions);
  }
 
  proposeToArchiveButton = (onInitiateConsentToArchive) => {
    const $proposeToArchiveContainer = $('<div class="longPressButton askConsentToArchive" style="display:none"><div class="shortLine"/></div>');
    const $button = $('<button>propose to archive</button>');
    $button.on('mouseup', onInitiateConsentToArchive);
    $button.appendTo($proposeToArchiveContainer);
    return $proposeToArchiveContainer;
  };

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

    if (!this.messageData.threadEntryMessageId) {
      this.proposeToArchiveButton(this.initiateConsentToArchiveProcess).appendTo($textRecord);
      $textRecord.on('mousedown', () => {
        if (!this.messageData.inConsentToArchiveProcess) {
          $textRecord.find('.askConsentToArchive').show();
        }
      });
    }

    const size = Math.round(50 / (Math.floor(Math.sqrt(Object.values(this.messageData.consentToArchiveRecords).length)) + 1));
    Object.values(this.messageData.consentToArchiveRecords).forEach(profile => {
      const $consentIndicator = $('<div class="consentIndicator"></div>');
      $consentIndicator.css({backgroundColor: profile.avatar})
      $consentIndicator.width(size);
      $consentIndicator.height(size);
      $consentIndicator.appendTo($textRecord);
    });

    return $textRecord;
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
      getThreadTail: this.getThreadTail,
      getBaseTextRecord: this.getBaseTextRecord,
      renderVotingButtons: this.renderVotingButtons,
      pollCreated: this.pollCreated,
    }).render();
  }
}