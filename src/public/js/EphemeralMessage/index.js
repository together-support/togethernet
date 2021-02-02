import store from '@js/store';
import ephemeralMessageRenderer from '@js/EphemeralMessageRenderer';
import isPlainObject from 'lodash/isPlainObject';
import {addSystemMessage} from '@js/Togethernet/systemMessage';
import sample from 'lodash/sample';

export default class EphemeralMessage {
  constructor (props) {
    this.messageData = {
      ...props, 
      id: `${props.roomId}-${props.gridColumnStart}-${props.gridRowStart}`,
    };

    if (props.inConsentToArchiveProcess) {
      const {consentToArchiveInitiator} = props;
      this.initConsentToArchiveReceived({consentToArchiveInitiator});
    }

    if (props.threadEntryMessageId && (!props.threadPreviousMessageId) && (!props.threadNextMessageId)) {
      this.setThreadInformation();
    }
  }

  setThreadInformation = () => {
    const {roomId, threadEntryMessageId} = this.messageData;
    const room = store.getRoom(roomId);

    const entryMessage = room.ephemeralHistory[threadEntryMessageId];
    const threadTail = entryMessage.getThreadTail();

    threadTail.messageData.threadNextMessageId = this.messageData.id;
    this.messageData.threadPreviousMessageId = threadTail.messageData.id;
  }

  getThreadTail = () => {
    const {roomId, threadNextMessageId} = this.messageData;
    if (!threadNextMessageId) { return this; }

    const ephemeralHistory = store.getRoom(roomId).ephemeralHistory;
    let threadNextMessage = ephemeralHistory[threadNextMessageId];
    while (threadNextMessage.messageData.threadNextMessageId) {
      threadNextMessage = ephemeralHistory[threadNextMessage.messageData.threadNextMessageId];
    }

    return threadNextMessage;
  }

  $textRecord = () => {
    return $(`#${this.messageData.id}`);
  }

  renderEphemeralMessageDetails = () => {
    $('.nonPinnedMessages').empty();
    $('.pinnedMessages').empty();
    $('.pinnedMessagesSummary i').addClass('collapsed');

    if (this.messageData.threadPreviousMessageId || this.messageData.threadNextMessageId) {
      this.renderThreadedDetails();
    } else {
      this.renderSingleEphemeralDetail();
    }
    $('.ephemeralMessageContainer').finish().show();
  }

  renderSingleEphemeralDetail = () => {
    const {isPinned, id, roomId} = this.messageData;

    const $messageContent = ephemeralMessageRenderer.renderEphemeralDetails(roomId, id);
    if (isPinned) {
      $messageContent.appendTo($('.pinnedMessages'));
      $('.pinnedMessages').show();
    }  else {
      $messageContent.appendTo($('.nonPinnedMessages'));
    }
  }

  renderThreadedDetails = () => {
    const {id, roomId, threadNextMessageId, threadPreviousMessageId} = this.messageData;
    const {ephemeralHistory} = store.getRoom(roomId);

    const $thisMessageContent = ephemeralMessageRenderer.renderEphemeralDetails(roomId, id);
    $thisMessageContent.appendTo($('.nonPinnedMessages'));

    let travelThreadNextMessageId = threadNextMessageId;
    let travelCurrentThreadTail = id;
    while (travelThreadNextMessageId) {
      const $messageContent = ephemeralMessageRenderer.renderEphemeralDetails(roomId, travelThreadNextMessageId);
      $messageContent.insertAfter(`#ephemeralDetails-${travelCurrentThreadTail}`);
      travelCurrentThreadTail = travelThreadNextMessageId;
      const record = ephemeralHistory[travelThreadNextMessageId];
      travelThreadNextMessageId = record.messageData.threadNextMessageId;
    }

    let travelThreadPreviousMessageId = threadPreviousMessageId;
    let travelCurrentThreadHead = id;
    while (travelThreadPreviousMessageId) {
      const $messageContent = ephemeralMessageRenderer.renderEphemeralDetails(roomId, travelThreadPreviousMessageId);
      $messageContent.insertBefore(`#ephemeralDetails-${travelCurrentThreadHead}`);
      travelCurrentThreadHead = travelThreadPreviousMessageId;
      const record = ephemeralHistory[travelThreadPreviousMessageId];
      travelThreadPreviousMessageId = record.messageData.threadPreviousMessageId;
    }
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

  handleRemoveMessageInThread = () => {
    store.sendToPeers({
      type: 'removeMessageInThread',
      data: {
        roomId: this.messageData.roomId,
        messageId: this.messageData.id
      }
    });
    this.clearMessageInThread();
  }

  clearMessageInThread = () => {
    this.messageData.content = '[message removed]';
    this.messageData.name = '';
    $(`#ephemeralDetails-${this.messageData.id}`).text('[message removed]');
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
    };
    if ($(`#ephemeralDetails-${this.messageData.id}`).is(':visible')) {
      this.renderEphemeralMessageDetails();
    }
  }

  initiateConsentToArchiveProcess = () => {
    const {roomId, id} = this.messageData;
    addSystemMessage('you have just asked for everyone\'s consent to archive the message');
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
    addSystemMessage(`${consentToArchiveInitiator} has just asked for your consent to archive this message. \n\n move your avatar so that it overalps with the message. \n\n enter (y) for YES and (s) for STOP`);
    this.messageData.consentToArchiveInitiator = consentToArchiveInitiator;
    this.performConsentToArchive();
  }

  performConsentToArchive = () => {
    this.messageData.inConsentToArchiveProcess = true;
    const {roomId} = this.messageData;

    this.$textRecord().addClass('inConsentProcess');
    $('#user .avatar').addClass('inConsentProcess');
    $(`#${roomId}`).find('.consentToArchiveOverlay').show();
    $(`#${roomId}`).off('keyup', this.consentToArchiveActions);
    $(`#${roomId}`).on('keyup', this.consentToArchiveActions);
  }

  consentToArchiveActions = (e) => {
    const {gridColumnStart, gridRowStart, consentToArchiveRecords} = this.messageData;
    const userGridColumnStart = $('#user .shadow').css('grid-column-start');
    const userGridRowStart = $('#user .shadow').css('grid-row-start');
    const alignedWithMessage = String(gridColumnStart) === String(userGridColumnStart) && String(gridRowStart) === String(userGridRowStart);
    const alreadyGaveConsent = isPlainObject(consentToArchiveRecords) && consentToArchiveRecords[store.getCurrentUser().socketId];
    
    if (alignedWithMessage) {
      if (e.key === 'y') {
        if (!alreadyGaveConsent) {
          this.giveConsentToArchive();
        }
      } else if (e.key === 's') {
        this.blockConsentToArchive();
      }
    }
  }
  giveConsentToArchive = () => {
    this.consentToArchiveReceived(store.getCurrentUser());
    addSystemMessage('You\'ve given your consent to archive this message.\n\nwaiting for peers to give their consent...');
    const {id, roomId} = this.messageData;
    store.sendToPeers({
      type: 'giveConsentToArchive', 
      data: {
        roomId, 
        messageId: id,
      }
    });
  }

  consentToArchiveReceived = (user) => {
    const {socketId, avatar} = user.getProfile();
    const {consentToArchiveRecords = {}, roomId} = this.messageData;
    const room = store.getRoom(roomId);
    if (!consentToArchiveRecords[socketId]) {
      this.messageData.consentToArchiveRecords = {...consentToArchiveRecords, [socketId]: user.getProfile()};
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

    if (Object.keys(this.messageData.consentToArchiveRecords).length === Object.keys(room.memberships.members).length) {
      this.archiveMessage();
    }
  }

  archiveMessage = () => {
    const {id, content, name, roomId, consentToArchiveRecords} = this.messageData;
    fetch('/archive', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        author: name, 
        content,
        room_id: roomId,
        participant_ids: Object.keys(consentToArchiveRecords),
        participant_names: Object.values(consentToArchiveRecords).map(r => r.name),
        message_type: 'text_message'
      })
    }).then(response => 
      response.json()
    ).then((archivedMessage) => {
      this.messageArchived({archivedMessageId: archivedMessage.id});
      store.sendToPeers({
        type: 'messageArchived', 
        data: {
          roomId, 
          messageId: id,
          archivedMessageId: archivedMessage.id,
        }
      });
    }).catch(e => 
      console.log(e)
    );
  }

  messageArchived = ({archivedMessageId}) => {
    this.messageData.archivedMessageId = archivedMessageId;
    const consentColors = Object.values(this.messageData.consentToArchiveRecords).map(profile => profile.avatar);
    this.$textRecord().find('.consentIndicator').remove();
    Array.from({length: 25}).forEach(() => {
      const color = sample(consentColors);    
      const $consentIndicator = $('<div class="consentIndicator given"></div>');
      $consentIndicator.css({backgroundColor: color});
      $consentIndicator.appendTo(this.$textRecord());  
    });

    this.finishConsentToArchiveProcess();
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
    this.messageData.archivedMessageId = null;
    $(`#ephemeralDetails-${this.messageData.id}`)
      .find('.initConsentToArchiveProcess')
      .removeClass('checked');
  }

  finishConsentToArchiveProcess = () => {
    this.messageData.inConsentToArchiveProcess = false;

    const {roomId} = this.messageData;

    this.$textRecord().removeClass('inConsentProcess');
    $(`#${roomId}`).find('#user .avatar').removeClass('inConsentProcess');
    $(`#${roomId}`).find('.consentToArchiveOverlay').hide();
    $(`#${roomId}`).off('keyup', this.consentToArchiveActions);
  }

  indicateMessagesInThread = () => {
    this.$textRecord().find('.threadedRecordOverlay').show();

    const {roomId, threadNextMessageId, threadPreviousMessageId} = this.messageData;
    const {ephemeralHistory} = store.getRoom(roomId);

    let travelThreadNextMessageId = threadNextMessageId;
    while (travelThreadNextMessageId) {
      const record = ephemeralHistory[travelThreadNextMessageId];
      record.$textRecord().finish().find('.threadedRecordOverlay').show();
      travelThreadNextMessageId = record.messageData.threadNextMessageId;
    }

    let travelThreadPreviousMessageId = threadPreviousMessageId;
    while (travelThreadPreviousMessageId) {
      const record = ephemeralHistory[travelThreadPreviousMessageId];
      record.$textRecord().finish().find('.threadedRecordOverlay').show();
      travelThreadPreviousMessageId = record.messageData.threadPreviousMessageId;
    }
  }

  render = () => {
    const {id, gridColumnStart, gridRowStart, avatar, roomId} = this.messageData;

    const $ephemeralRecordTemplate = $(document.getElementById('ephemeralRecordTemplate').content.cloneNode(true));
    const $ephemeralRecord = $ephemeralRecordTemplate.find('.ephemeralRecord');

    $ephemeralRecord.attr('id', id);
    $ephemeralRecord[0].style.gridColumnStart = gridColumnStart;
    $ephemeralRecord[0].style.gridRowStart = gridRowStart;

    $ephemeralRecord
      .on('mouseenter', this.renderEphemeralMessageDetails)
      .on('mouseleave', () => {
        if (!store.getCurrentUser().getAdjacentMessageIds().includes(id)) {
          $('.ephemeralMessageContainer').finish().fadeOut(500);
        }
      });

    $ephemeralRecord.on('adjacent', this.renderEphemeralMessageDetails);
    $ephemeralRecord.on('indicateThread', this.indicateMessagesInThread);

    $ephemeralRecord.css({backgroundColor: avatar});
    $ephemeralRecord.appendTo($(`#${roomId}`));
  }
}