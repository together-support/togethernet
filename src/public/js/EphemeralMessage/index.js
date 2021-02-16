import store from '@js/store';
import { renderEphemeralDetails } from '@js/EphemeralMessageRenderer';
import isPlainObject from 'lodash/isPlainObject';
import {
  addSystemConfirmMessage,
  addSystemNotifyMessage,
  addSystemPopupMessage,
  clearSystemPopupMessage,
  clearSystemMessage
} from '@js/Togethernet/systemMessage';
import {
  systemConfirmMsgConfirmConsentToArchive,
  systemConfirmMsgConsentToArchive,
  systemConfirmMsgInitiateConsentToArchiveProcess,
  systemNotifyMsgBlockConsentToArchive,
  systemNotifyMsgGiveConsentToArchive,
  systemPopupMsgConsentToArchive
} from '@js/constants.js';
import sample from 'lodash/sample';
import transform from 'lodash/transform';
import pick from 'lodash/pick';

export default class EphemeralMessage {
  constructor(props) {
    this.messageData = {
      ...props,
      id: `${props.roomId}-${props.gridColumnStart}-${props.gridRowStart}`,
    };

    if (props.inConsentToArchiveProcess) {
      const { consentToArchiveInitiator } = props;
      this.initConsentToArchiveReceived({ consentToArchiveInitiator });
    }

    if (
      props.threadEntryMessageId &&
      !props.threadPreviousMessageId &&
      !props.threadNextMessageId
    ) {
      this.setThreadInformation();
    }
  }

  setThreadInformation = () => {
    const { roomId, threadEntryMessageId } = this.messageData;
    const room = store.getRoom(roomId);

    const entryMessage = room.ephemeralHistory[threadEntryMessageId];
    const threadTail = entryMessage.getThreadTail();

    threadTail.messageData.threadNextMessageId = this.messageData.id;
    this.messageData.threadPreviousMessageId = threadTail.messageData.id;
  };

  getThreadTail = () => {
    const { roomId, threadNextMessageId } = this.messageData;
    if (!threadNextMessageId) {
      return this;
    }

    const ephemeralHistory = store.getRoom(roomId).ephemeralHistory;
    let threadNextMessage = ephemeralHistory[threadNextMessageId];
    while (threadNextMessage.messageData.threadNextMessageId) {
      threadNextMessage =
        ephemeralHistory[threadNextMessage.messageData.threadNextMessageId];
    }

    return threadNextMessage;
  };

  $textRecord = () => {
    return $(`#${this.messageData.id}`);
  };

  renderEphemeralMessageDetails = () => {
    $('.nonPinnedMessages').empty();
    $('.pinnedMessages').empty();
    $('.pinnedMessagesSummary i').addClass('collapsed');

    if (
      this.messageData.threadPreviousMessageId ||
      this.messageData.threadNextMessageId
    ) {
      this.renderThreadedDetails();
    } else {
      this.renderSingleEphemeralDetail();
    }
    $('.ephemeralMessageContainer').finish().show();
  };

  renderSingleEphemeralDetail = () => {
    const { isPinned, id, roomId } = this.messageData;

    const $messageContent = renderEphemeralDetails(roomId, id);
    if (isPinned) {
      $messageContent.appendTo($('.pinnedMessages'));
      $('.pinnedMessages').show();
    } else {
      $messageContent.appendTo($('.nonPinnedMessages'));
    }
  };

  renderThreadedDetails = () => {
    const {
      id,
      roomId,
      threadNextMessageId,
      threadPreviousMessageId,
    } = this.messageData;
    const { ephemeralHistory } = store.getRoom(roomId);

    const $thisMessageContent = renderEphemeralDetails(roomId, id);
    $thisMessageContent.appendTo($('.nonPinnedMessages'));

    let travelThreadNextMessageId = threadNextMessageId;
    let travelCurrentThreadTail = id;

    while (travelThreadNextMessageId) {
      const $messageContent = renderEphemeralDetails(
        roomId,
        travelThreadNextMessageId
      );
      $messageContent.insertAfter(
        `#ephemeralDetails-${travelCurrentThreadTail}`
      );
      travelCurrentThreadTail = travelThreadNextMessageId;
      const record = ephemeralHistory[travelThreadNextMessageId];
      travelThreadNextMessageId = record.messageData.threadNextMessageId;
    }

    let travelThreadPreviousMessageId = threadPreviousMessageId;
    let travelCurrentThreadHead = id;
    while (travelThreadPreviousMessageId) {
      const $messageContent = renderEphemeralDetails(
        roomId,
        travelThreadPreviousMessageId
      );
      $messageContent.insertBefore(
        `#ephemeralDetails-${travelCurrentThreadHead}`
      );
      travelCurrentThreadHead = travelThreadPreviousMessageId;
      const record = ephemeralHistory[travelThreadPreviousMessageId];
      travelThreadPreviousMessageId =
        record.messageData.threadPreviousMessageId;
    }
  };

  purgeSelf = () => {
    if (
      this.messageData.threadNextMessageId ||
      this.messageData.threadPreviousMessageId
    ) {
      this.handleRemoveMessageInThread();
    } else {
      this.handleRemoveSingleMessage();
    }
  };

  handleRemoveSingleMessage = () => {
    const room = store.getRoom(this.messageData.roomId);
    const $textRecord = this.$textRecord();

    $('.nonPinnedMessages').empty();
    $('.ephemeralMessageContainer').hide();
    $textRecord.finish().animate(
      { opacity: 0 },
      {
        complete: () => {
          $textRecord.remove();
          store.sendToPeers({
            type: 'removeEphemeralMessage',
            data: {
              messageId: this.messageData.id,
              roomId: this.messageData.roomId,
            },
          });
          room.removeEphemeralHistory(this.messageData.id);
        },
      }
    );
  };

  handleRemoveMessageInThread = () => {
    store.sendToPeers({
      type: 'removeMessageInThread',
      data: {
        roomId: this.messageData.roomId,
        messageId: this.messageData.id,
      },
    });
    this.clearMessageInThread();
  };

  clearMessageInThread = () => {
    this.messageData.content = '[message removed]';
    this.messageData.name = '';
    $(`#ephemeralDetails-${this.messageData.id}`).text('[message removed]');
  };

  castVote = (option) => {
    const { votingRecords, id } = this.messageData;
    const myId = store.getCurrentUser().socketId;
    const myCurrentVote = isPlainObject(votingRecords) && votingRecords[myId];
    const data = {
      textRecordId: id,
      option,
      ...store.getCurrentUser().getProfile(),
    };

    if (myCurrentVote) {
      if (myCurrentVote === option) {
        store.sendToPeers({ type: 'voteRetracted', data });
        this.voteRetracted(data);
      } else {
        store.sendToPeers({ type: 'voteChanged', data });
        this.voteChanged(data);
      }
    } else {
      store.sendToPeers({ type: 'voteCasted', data });
      this.voteReceived(data);
    }
  };

  voteReceived = ({ option, socketId }) => {
    const { votes = {}, votingRecords, id } = this.messageData;
    this.messageData.votes = {
      ...votes,
      [option]: isNaN(votes[option]) ? 1 : votes[option] + 1,
    };
    this.messageData.votingRecords = {
      ...votingRecords,
      [socketId]: option,
    };

    $(`#ephemeralDetails-${id} .voteOption.${option} .voteCount`).text(
      this.messageData.votes[option]
    );
  };

  voteRetracted = ({ option, socketId }) => {
    const { votes = {}, id } = this.messageData;
    this.messageData.votes = {
      ...votes,
      [option]: isNaN(votes[option]) ? 1 : votes[option] - 1,
    };

    if (isPlainObject(delete this.messageData.votingRecords)) {
      delete this.messageData.votingRecords[socketId];
    }

    $(`#ephemeralDetails-${id} .voteOption.${option} .voteCount`).text(
      this.messageData.votes[option]
    );
  };

  voteChanged = ({ option, socketId }) => {
    const currentVote = this.messageData.votingRecords[socketId];
    this.voteRetracted({ option: currentVote, socketId });
    this.voteReceived({ option, socketId });
  };

  createPoll = () => {
    const { roomId, id } = this.messageData;
    this.pollCreated();
    store.sendToPeers({
      type: 'pollCreated',
      data: { roomId, textRecordId: id },
    });
  };

  pollCreated = () => {
    this.messageData.canVote = true;
    this.votes = {
      yes: 0,
      no: 0,
      neutral: 0,
    };
    if ($(`#ephemeralDetails-${this.messageData.id}`).is(':visible')) {
      this.renderEphemeralMessageDetails();
    }
  };

  consentToArchiveButtonClicked = () => {
    addSystemConfirmMessage(systemConfirmMsgConfirmConsentToArchive, this);
  };

  initiateConsentToArchiveProcess = () => {
    const { roomId, id } = this.messageData;
    addSystemConfirmMessage(systemConfirmMsgInitiateConsentToArchiveProcess);
    store.sendToPeers({
      type: 'initConsentToArchiveProcess',
      data: {
        roomId,
        messageId: id,
      },
    });

    this.performConsentToArchive();
  };

  initConsentToArchiveReceived = ({ consentToArchiveInitiator }) => {
    if (consentToArchiveInitiator != null) {
      addSystemConfirmMessage({
        msgType: systemConfirmMsgConsentToArchive.msgType,
        msgHeader: systemConfirmMsgConsentToArchive.msgHeader,
        msgBody: `${consentToArchiveInitiator} ${systemConfirmMsgConsentToArchive.msgBody}`,
        msgFooter: systemConfirmMsgConsentToArchive.msgFooter,
        yayText: systemConfirmMsgConsentToArchive.yayText,
        nayText: systemConfirmMsgConsentToArchive.nayText,
        yayBtn: systemConfirmMsgConsentToArchive.yayBtn,
        nayBtn: systemConfirmMsgConsentToArchive.nayBtn,
      });
    }

    this.messageData.consentToArchiveInitiator = consentToArchiveInitiator;
    this.performConsentToArchive();
  };

  performConsentToArchive = () => {
    this.messageData.inConsentToArchiveProcess = true;
    const { roomId } = this.messageData;
    addSystemPopupMessage(systemPopupMsgConsentToArchive);
    this.$textRecord().addClass('inConsentProcess');
    $('#user .avatar').addClass('inConsentProcess');
    $('.ephemeralMessageContainer').addClass('inConsentProcess');
    $(`#${roomId}`).find('.consentToArchiveOverlay').show();
    $(`#${roomId}`).off('keyup', this.consentToArchiveActions);
    $(`#${roomId}`).on('keyup', this.consentToArchiveActions);
    $('.initConsentToArchiveProcess').hide();
    $('#writeMessage').attr('disabled', 'disabled');
    $('#writeMessage').attr('placeholder', 'Messaging currently unavailable');

    this.getMessagesInThread().forEach((message) =>
      message.$textRecord().addClass('inConsentProcess')
    );
  };

  getNextMessage = () => {
    const { roomId, threadNextMessageId } = this.messageData;
    if (threadNextMessageId) {
      const { ephemeralHistory } = store.getRoom(roomId);
      return ephemeralHistory[threadNextMessageId];
    }
  };

  getPreviousMessage = () => {
    const { roomId, threadPreviousMessageId } = this.messageData;
    if (threadPreviousMessageId) {
      const { ephemeralHistory } = store.getRoom(roomId);
      return ephemeralHistory[threadPreviousMessageId];
    }
  };

  getMessagesInThread = () => {
    const messagesInThread = [this];

    let travelThreadNextMessage = this.getNextMessage();
    while (travelThreadNextMessage) {
      messagesInThread.push(travelThreadNextMessage);
      travelThreadNextMessage = travelThreadNextMessage.getNextMessage();
    }

    let travelThreadPreviousMessage = this.getPreviousMessage();
    while (travelThreadPreviousMessage) {
      messagesInThread.push(travelThreadPreviousMessage);
      travelThreadPreviousMessage = travelThreadPreviousMessage.getPreviousMessage();
    }

    return messagesInThread;
  };

  consentToArchiveActions = (e) => {
    const {
      consentToArchiveRecords
    } = this.messageData;
    const alreadyGaveConsent =
      isPlainObject(consentToArchiveRecords) &&
      consentToArchiveRecords[store.getCurrentUser().socketId];

    if (e.key === 'y') {
      if (!alreadyGaveConsent) {
        this.giveConsentToArchive();
      }
    } else if (e.key === 's') {
      this.blockConsentToArchive();
    }
  };
  giveConsentToArchive = () => {
    this.consentToArchiveReceived(store.getCurrentUser());
    addSystemNotifyMessage(systemNotifyMsgGiveConsentToArchive);
    const { id, roomId } = this.messageData;
    const room = store.getRoom(roomId);
    store.sendToPeers({
      type: 'giveConsentToArchive',
      data: {
        roomId,
        messageId: id,
      },
    });

    if (Object.keys(this.messageData.consentToArchiveRecords).length === Object.keys(room.memberships.members).length) {
      this.archiveMessage();
    }
  }

  consentToArchiveReceived = (user) => {
    const {socketId, avatar} = user.getProfile();
    const {consentToArchiveRecords = {}} = this.messageData;
    if (!consentToArchiveRecords[socketId]) {
      this.messageData.consentToArchiveRecords = {
        ...consentToArchiveRecords,
        [socketId]: user.getProfile(),
      };
    }

    const size = Math.round(
      this.$textRecord().outerWidth() /
        (Math.floor(
          Math.sqrt(
            Object.keys(this.messageData.consentToArchiveRecords).length
          )
        ) +
          1)
    );
    const $consentIndicator = $('<div class="consentIndicator"></div>');
    $consentIndicator.css({ backgroundColor: avatar });
    $consentIndicator.width(size);
    $consentIndicator.height(size);

    this.$textRecord()
      .find('.consentIndicator')
      .each((_, el) => {
        $(el).width(size);
        $(el).height(size);
      });

    $consentIndicator.appendTo(this.$textRecord());
  }

  getArchivedMessageBody = () => {
    const {
      content,
      name,
      roomId,
      consentToArchiveRecords,
      threadNextMessageId,
      threadPreviousMessageId,
    } = this.messageData;
    let body = {
      author: name,
      content: content,
      room_id: roomId,
      participant_ids: Object.keys(consentToArchiveRecords),
      participant_names: Object.values(consentToArchiveRecords).map(
        (r) => r.name
      ),
    };

    if (threadNextMessageId || threadPreviousMessageId) {
      body.message_type = 'thread';
      body.thread_data = transform(
        this.getMessagesInThread(),
        (result, record) => {
          result[record.messageData.id] = pick(record.messageData, [
            'name',
            'content',
            'threadNextMessageId',
            'threadPreviousMessageId',
          ]);
        },
        {}
      );
    } else {
      body.message_type = 'text_message';
    }
    return JSON.stringify(body);
  };

  archiveMessage = () => {
    const { id, roomId } = this.messageData;
    const body = this.getArchivedMessageBody();
    fetch('/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
      .then((response) => response.json())
      .then((archivedMessage) => {
        this.messageArchived({ archivedMessageId: archivedMessage.id });
        store.sendToPeers({
          type: 'messageArchived',
          data: {
            roomId,
            messageId: id,
            archivedMessageId: archivedMessage.id,
          },
        });
      })
      .catch((e) => console.log(e));
  };

  messageArchived = ({ archivedMessageId }) => {
    const consentColors = Object.values(
      this.messageData.consentToArchiveRecords
    ).map((profile) => profile.avatar);
    this.getMessagesInThread().forEach((record) => {
      record.messageData.archivedMessageId = archivedMessageId;
      record.$textRecord().find('.consentIndicator').remove();
      Array.from({ length: 25 }).forEach(() => {
        const color = sample(consentColors);
        const $consentIndicator = $(
          '<div class="consentIndicator given"></div>'
        );
        $consentIndicator.css({ backgroundColor: color });
        $consentIndicator.appendTo(record.$textRecord());
      });
    });

    this.finishConsentToArchiveProcess();
  };

  blockConsentToArchive = () => {
    this.consentToArchiveBlocked();
    addSystemNotifyMessage(systemNotifyMsgBlockConsentToArchive);

    const { id, roomId } = this.messageData;
    store.sendToPeers({
      type: 'blockConsentToArchive',
      data: {
        roomId,
        messageId: id,
      },
    });
  };

  consentToArchiveBlocked = () => {
    this.$textRecord().find('.consentIndicator').remove();
    this.finishConsentToArchiveProcess();
    this.messageData.consentToArchiveRecords = {};
    this.messageData.archivedMessageId = null;
    $(`#ephemeralDetails-${this.messageData.id}`)
      .find('.initConsentToArchiveProcess')
      .removeClass('checked');
  };

  finishConsentToArchiveProcess = () => {
    this.messageData.inConsentToArchiveProcess = false;

    const { roomId } = this.messageData;

    this.getMessagesInThread().forEach((record) => {
      record.$textRecord().removeClass('inConsentProcess');
    });

    $(`#${roomId}`).find('#user .avatar').removeClass('inConsentProcess');
    $(`#${roomId}`).find('.consentToArchiveOverlay').hide();
    $(`#${roomId}`).off('keyup', this.consentToArchiveActions);
    clearSystemPopupMessage();
    $('#writeMessage').removeAttr('disabled');
    $('#writeMessage').attr('placeholder', 'Type your message here');
  };

  indicateMessagesInThread = () => {
    this.getMessagesInThread().forEach((record) =>
      record.$textRecord().finish().find('.threadedRecordOverlay').show()
    );
  };

  indicateThreadForbidden = () => {
    this.getMessagesInThread().forEach((record) =>
      record
        .$textRecord()
        .finish()
        .find('.threadedRecordForbiddenOverlay')
        .show()
    );
  };

  render = () => {
    const {
      id,
      gridColumnStart,
      gridRowStart,
      avatar,
      roomId,
    } = this.messageData;

    const $ephemeralRecordTemplate = $(
      document.getElementById('ephemeralRecordTemplate').content.cloneNode(true)
    );
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
    $ephemeralRecord.on(
      'indicateThreadForbidden',
      this.indicateThreadForbidden
    );

    $ephemeralRecord.css({ backgroundColor: avatar });
    $ephemeralRecord.appendTo($(`#${roomId}`));
  };
}
