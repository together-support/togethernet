import PeerConnection from '@js/PeerConnection';
import Room from '@js/Room';
import ArchivalSpace from '@js/ArchivalSpace';
import RoomForm from '@js/RoomForm';
import {sendMessage} from '@js/EphemeralMessage/sendText';
import {
  addSystemConfirmMessage
} from '@js/Togethernet/systemMessage';
import { systemConfirmMsgEphemeralRoom } from '@js/constants.js';
import store from '@js/store';
import publicConfig from '@public/config';
import {EGALITARIAN_MODE} from '@js/constants';
import ephemeralMessageRenderer from '@js/EphemeralMessageRenderer';

class Togethernet {
  initialize = async () => {
    await this.initDefaultRooms();
    this.attachUIEvents();
    new RoomForm().initialize();
    new PeerConnection().connect();
  };

  initDefaultRooms = async () => {
    const archivalSpace = await this.initArchivalSpace();
    const defaultEphemeralRoom = await this.initDefaultEphemeralRoom();

    store.rooms = {
      'sitting-at-the-park': defaultEphemeralRoom,
      archivalSpace: archivalSpace,
    };
  };

  initArchivalSpace = async () => {
    const archivalSpace = new ArchivalSpace();
    await archivalSpace.initialize();
    return archivalSpace;
  };

  initDefaultEphemeralRoom = () => {
    const defaultEphemeralRoom = new Room({
      mode: publicConfig.defaultMode || EGALITARIAN_MODE,
      ephemeral: true,
      roomId: 'sitting-at-the-park',
    });
    defaultEphemeralRoom.attachEvents();
    addSystemConfirmMessage(systemConfirmMsgEphemeralRoom);
    return defaultEphemeralRoom;
  };

  attachUIEvents = () => {
    this.handleMessageSendingEvents();
    this.addKeyboardCues();
    this.detectThreadStart();
    this.hideInteractionButtonsOnMouseLeave();
    $('#pinMessage').on('click', () => $('#pinMessage').toggleClass('clicked'));
    $('.pinnedMessagesSummary').on('click', () => {
      $('.pinnedMessages').empty();
      $('.pinnedMessagesSummary i').removeClass('collapsed');

      const {ephemeralHistory, roomId} = store.getCurrentRoom();
      const pinnedRecords = Object.values(ephemeralHistory).filter(
        (record) => record.messageData.isPinned
      );
      pinnedRecords.forEach(({messageData: {id}}) => {
        const $messageContent = ephemeralMessageRenderer.renderEphemeralDetails(
          roomId,
          id
        );
        $messageContent.appendTo('.pinnedMessages');
      });
    });
  };

  handleMessageSendingEvents = () => {
    $('#writeMessage').on('keyup', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  };

  addKeyboardCues = () => {
    document.addEventListener('keyup', (e) => {
      if (e.shiftKey && e.key === ' ') {
        e.preventDefault();
        const $visibleEphmeralRoom = $('.room:visible').get(0);
        if (document.activeElement.id === 'writeMessage') {
          $visibleEphmeralRoom && $visibleEphmeralRoom.focus();
        } else if ($(document.activeElement).hasClass('room')) {
          $('#writeMessage').focus();
        } else {
          $visibleEphmeralRoom && $visibleEphmeralRoom.focus();
        }
      }

      if (
        e.key.length === 1 &&
        document.activeElement.id !== 'writeMessage' &&
        !e.shiftKey
      ) {
        $('#writeMessage').delay(100).fadeOut(150).fadeIn(100);
      }
    });
  };

  detectThreadStart = () => {
    $('#writeMessage').on('messageThread', (e) => {
      if (e.threadPreviousMessage) {
        $(e.target).attr(
          'data-thread-entry-message',
          e.threadPreviousMessage.id
        );
      } else {
        $(e.target).removeAttr('data-thread-entry-message');
      }
    });
  };

  hideInteractionButtonsOnMouseLeave = () => {
    $(document).on('mouseup', () => $('.longPressButton').hide());
  };
}

export default Togethernet;
