import RoomMembership from '@js/RoomMembership';
import ArchivedMessage from '@js/ArchivedMessage';
import store from '@js/store';
import {addSystemMessage} from '@js/Togethernet/systemMessage';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import filter from 'lodash/filter';
import {updateMessage, addComment} from '@js/api';
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
    $('#archivalCommentInput').on('keyup', this.addComment);
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
    const messageContent = $('#archivalCommentInput').val();

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
      $('#archivalCommentInput').removeAttr('disabled');
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
    const {message_type, commentable_id} = messageData;
    const message = new ArchivedMessage(messageData, this.getIndex(messageData));
    const $details = message.renderMessageDetails();
    if (message_type === 'text_message') {
      $details.appendTo($('#archivalMessagesDetailsContainer'));
    } else if (message_type === 'comment') {
      $details.insertAfter($(`#archivedMessageDetails-${commentable_id}`));
    }
  }

  getIndex = (messageData) => {
    const {room_id, created_at} = messageData;
    return 0;
  }

  appendDateGroup = (date) => {
    const $dateHeading = $('<h3></h3>');
    $dateHeading.text(date);
    $dateHeading.appendTo($('#archivalMessagesDetailsContainer'));

    const $dateGroupForMessageRecords = $(`<div class="archiveGroup dateGroup" id="dateGroup-${date.replaceAll(' ', '-')}"></div>`);
    $dateGroupForMessageRecords.appendTo($('#archivalMessagesContainer'));
  }

  appendRoomGroup = (room, date) => {
    const $roomHeading = $('<h3></h3>');
    $roomHeading.text(room);
    $roomHeading.appendTo($('#archivalMessagesDetailsContainer'));

    const $roomGroup = $(`<div class="archiveGroup roomGroup roomGroup-${room}"></div>`);
    $roomGroup.appendTo($(`#dateGroup-${date.replaceAll(' ', '-')}`));
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

  markMessageDeleted = () => {
    if (this.isEditingMessageId && store.getCurrentUser().socketId === this.editor) {
      const content = `message deleted by ${store.getCurrentUser().getProfile().name}. ${moment().format('MMMM D h:mm')}`;
      updateMessage({
        messageId: this.isEditingMessageId,
        content
      });
    }
  }

  renderMessageRecords = () => {
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
    this.renderMessageRecords();
    this.renderComments();
  }
}

export default ArchivalSpace;