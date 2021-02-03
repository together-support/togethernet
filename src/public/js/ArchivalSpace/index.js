import RoomMembership from '@js/RoomMembership';
import ArchivedMessage from '@js/ArchivedMessage';
import store from '@js/store';
import {addSystemMessage} from '@js/Togethernet/systemMessage';
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import filter from 'lodash/filter';
import moment from 'moment';
import {formatDateString, formatDateLabel} from '@js/utils';

class ArchivalSpace {
  static isEphemeral = false;

  constructor () {
    this.messageRecords = [];
    this.memberships = new RoomMembership('archivalSpace');

    this.editor = null;
    this.isCommentingOnId = null;

    this.$roomLink = $('#archivalSpaceLink');
  }

  initialize = () => {
    this.fetchArchivedMessages().then(() => {
      this.attachEvents();
      this.render();
    });
  };

  attachEvents = () => {
    this.$roomLink.on('click', this.goToRoom);
    $('#deleteArchivedMessage').on('click', this.markMessageDeleted);
    $('#downloadArchives').on('click', this.downloadArchives);
  };

  goToRoom = () => {
    $('#writeMessage').attr('disabled', 'disabled');
    $('#writeMessage').attr('placeholder', 'Add comment');
    $('.ephemeralView').hide();
    $('.ephemeralMessageContainer').hide();
    $('#pinMessage').hide();
    $('.roomLink').removeClass('currentRoom');
    this.$roomLink.addClass('currentRoom');
    if (this.memberships.isEmpty() || !this.editor || !store.getPeer(this.editor)) {
      this.setEditor(store.getCurrentUser());
      addSystemMessage('Privacy Scenario: posting-on-a-bulletin-board \n\n You’ve posted a flyer on the bulletin board on your campus. Day in and day out, friends, acquaintances, and strangers pass by and pause to take a look at what you’ve posted. Some of them may even take a photo of the flyer on their phone to show it to other people.');
    } else {
      const editorProfile = store.getPeer(this.editor).getProfile();
      addSystemMessage(`You have landed in the archival channel and ${editorProfile.name} is currently editing`);
    }
    this.addMember(store.getCurrentUser());
    $('#downloadArchives').show();
    $('#archivalSpace').show();

    store.sendToPeers({
      type: 'joinedRoom',
      data: {
        joinedRoomId: 'archivalSpace',
      }
    });
  }

  downloadArchives = () => {
    const archiveContent = $('#archivalMessagesDetailsContainer').html();
    $('#downloadArchives').attr({
      'download': `togethernetArchives-${moment().format('MM dd YY')}.html`,
      'href': 'data:text/plain;charset=utf-8,' + encodeURIComponent(archiveContent),
    });
  }

  addMember = (user) => {
    this.memberships.addMember(user);
  }

  setEditor = (user) => {
    if (this.memberships.isEmpty()) {
      const editorProfile = user.getProfile();
      this.editor = editorProfile.socketId;
      $('#editorOptions').find('.editorName').text(editorProfile.name);
      $('#editorOptions').find('.editorAvatar').css({backgroundColor: editorProfile.avatar});
    }
  }

  fetchArchivedMessages = async () => {
    const response = await fetch('/archive', {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    });

    const messageRecords = await response.json(); 
    this.messageRecords = messageRecords;
  }

  archivedMessageUpdated = ({messageData}) => {
    const {id, content} = messageData;
    $(`#archivedMessageDetails-${id}`).find('.content').text(content);
    if (this.isEditingMessageId === id) {
      $(`#archivedMessageRecord-${id}`).removeClass('isEditing');
      this.isEditingMessageId = null;
    }
  }

  archivedMessageDeleted = ({messageData}) => {
    const {id, room_id} = messageData;
    $(`#archivedMessageDetails-${id}`).remove();

    const room = store.getRoom(room_id);
    if (room) {
      const ephemeralMessage = Object.values(room.ephemeralHistory)
        .find(message => message.messageData.archivedMessageId === id);
      if (ephemeralMessage) {
        ephemeralMessage.consentToArchiveBlocked();
      }
    }
  }

  appendArchivedMessage = ({messageData}) => {
    const {message_type, commentable_id, room_id, created_at} = messageData;
    const message = new ArchivedMessage({messageData, index: this.getIndex(messageData)});
    const $details = message.renderArchivedMessage();
    if (!$(`#dateGroup-${formatDateLabel(created_at)}`).length) {
      this.appendDateGroup(created_at);
    }

    if (!$(`#dateGroup-${formatDateLabel(created_at)} .roomGroup-${room_id}`).length) {
      this.appendRoomGroup(room_id, created_at);
    }

    if (['text_message', 'thread'].includes(message_type)) {
      $details.appendTo($(`#dateGroup-${formatDateLabel(created_at)} .roomGroup-${room_id}`));
    } else if (message_type === 'comment') {
      $details.appendTo($(`#archivedMessageDetails-${commentable_id}`));
    }
  }

  getIndex = (messageData) => {
    if (['text_message', 'thread'].includes(messageData.message_type) ) {
      return this.getIndexForMessage(messageData);
    } else {
      return this.getIndexForMessageForComment(messageData);
    }
  }

  getIndexForMessage = (messageData) => {
    const {room_id, created_at} = messageData;
    const dateString = formatDateLabel(created_at);
    const $dateRoomGroup = $(`#dateGroup-${dateString} .roomGroup-${room_id}`);
    return $dateRoomGroup.find('.archivalMessagesDetails').length + 1;
  }

  getIndexForMessageForComment = (messageData) => {
    const {commentable_id} = messageData;
    const prefix = $(`#archivedMessageDetails-${commentable_id}`).find('.index').first().text();
    const suffix = $(`#archivedMessageDetails-${commentable_id}`).find('.comment').length + 1;
    return `${prefix}.${suffix}`;
  }

  appendDateGroup = (date) => {
    const $dateGroupForMessageRecords = $(`<div class="archiveGroup dateGroup" id="dateGroup-${formatDateLabel(date)}"></div>`);
    const $dateHeading = $('<h3></h3>');
    $dateHeading.text(formatDateString(date));
    $dateHeading.appendTo($dateGroupForMessageRecords);
    $dateGroupForMessageRecords.appendTo($('#archivalMessagesDetailsContainer'));
  }

  appendRoomGroup = (room, date) => {
    const $roomGroup = $(`<div class="archiveGroup roomGroup roomGroup-${room}"></div>`);
    const $roomHeading = $('<h3></h3>');
    $roomHeading.text(room);
    $roomHeading.appendTo($roomGroup);

    $roomGroup.appendTo($(`#dateGroup-${formatDateLabel(date)}`));
  }

  updateSelf = (data) => {
    const {editor, memberships} = data;
    this.editor = editor;
    Object.keys(memberships.members).forEach(memberId => {
      this.addMember(store.getPeer(memberId));
    });
  }

  groupedTextMessages = () => {
    const groupedMessages = {};
    const textMessages = filter(this.messageRecords, (record) => ['text_message', 'thread'].includes(record.message_type));
    const dateGroupedMessages = groupBy(textMessages, (messageRecord) => {
      return formatDateString(messageRecord.created_at);
    });

    orderBy(Object.keys(dateGroupedMessages), (date) => moment(date), ['desc', 'asc']).forEach(date => {
      groupedMessages[date] = groupBy(dateGroupedMessages[date], 'room_id');
    });

    return groupedMessages;
  }

  renderArchivedMessages = () => {
    const groupedMessages = this.groupedTextMessages();
    Object.keys(groupedMessages).forEach(date => {
      this.appendDateGroup(date);
      const messagesByDate = groupedMessages[date];
      Object.keys(messagesByDate).forEach(roomId => {
        this.appendRoomGroup(roomId, date);
        messagesByDate[roomId].forEach((messageData) => {
          this.appendArchivedMessage({messageData});
        });
      });
    });
  }

  renderComments = () => {
    const comments = filter(this.messageRecords, (record) => record.message_type === 'comment');
    comments.forEach(messageData => this.appendArchivedMessage({messageData}));
  }

  render = () => {
    this.renderArchivedMessages();
    this.renderComments();
  }
}

export default ArchivalSpace;