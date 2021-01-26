import RoomMembership from '@js/RoomMembership';
import ArchivedMessage from '@js/ArchivedMessage';
import store from '@js/store';
import {addSystemMessage} from '@js/Togethernet/systemMessage';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import filter from 'lodash/filter';
import {addComment} from '@js/api';
import moment from 'moment';
import {formatDateString, formatDateLabel} from '@js/utils';

class ArchivalSpace {
  static isEphemeral = false;

  constructor () {
    this.messageRecords = [];
    this.memberships = new RoomMembership('archivalSpace');

    this.editor = null;
    this.isEditingMessageId = null;

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
    $('#writeMessage').on('keyup', this.addComment);
    $('#downloadArchives').on('click', this.downloadArchives);
  };

  goToRoom = () => {
    $('.ephemeralView').hide();
    $('#pinMessage').hide();
    $('.roomLink').removeClass('currentRoom');
    this.$roomLink.addClass('currentRoom');
    if (this.memberships.isEmpty()) {
      addSystemMessage('You have landed in the archival channel and you are currently editing');
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

  addComment = (e) => {
    if (e.key !== 'Enter') {
      return;
    }
    const messageContent = $('#writeMessage').val();

    if (this.isEditingMessageId && Boolean(messageContent) && store.getCurrentUser().socketId === this.editor) {
      addComment({
        ...store.getCurrentUser().getProfile(),
        message: messageContent,
        commentableId: this.isEditingMessageId,
      });
    }
  }

  addMember = (user) => {
    this.setEditor(user);
    this.memberships.addMember(user);
  }

  setEditor = (user) => {
    if (this.memberships.isEmpty()) {
      const editorProfile = user.getProfile();
      this.editor = editorProfile.socketId;
      $('#writeMessage').removeAttr('disabled');
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

  appendArchivedMessage = ({messageData}) => {
    const {message_type, commentable_id, room_id, created_at} = messageData;
    const message = new ArchivedMessage({messageData, index: this.getIndex(messageData)});
    const $details = message.renderArchivedMessage();
    if (!$(`#dateGroup-${formatDateLabel(created_at)}`).length) {
      this.appendDateGroup(created_at);
    };

    if (!$(`#dateGroup-${formatDateLabel(created_at)} .roomGroup-${room_id}`).length) {
      this.appendRoomGroup(room_id, created_at);
    };

    if (message_type === 'text_message') {
      $details.appendTo($(`#dateGroup-${formatDateLabel(created_at)} .roomGroup-${room_id}`));
    } else if (message_type === 'comment') {
      $details.insertAfter($(`#archivedMessageDetails-${commentable_id}`));
    }
  }

  getIndex = (messageData) => {
    const {room_id, created_at} = messageData;
    const dateString = formatDateLabel(created_at);
    const $dateRoomGroup = $(`#dateGroup-${dateString} .roomGroup-${room_id}`);
    return $dateRoomGroup.find('.archivalMessagesDetails').length;
  }

  appendDateGroup = (date) => {
    const $dateGroupForMessageRecords = $(`<div class="archiveGroup dateGroup" id="dateGroup-${formatDateLabel(date)}"></div>`);
    const $dateHeading = $('<h3></h3>');
    $dateHeading.text(date);
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
    const textMessages = filter(this.messageRecords, (record) => record.message_type === 'text_message');
    const dateGroupedMessages = groupBy(textMessages, (messageRecord) => {
      return formatDateString(messageRecord.created_at);
    });

    sortBy(Object.keys(dateGroupedMessages), (date) => moment(date)).forEach(date => {
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