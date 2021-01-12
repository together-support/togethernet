import PeerConnection from '@js/PeerConnection';
import Room from '@js/Room';
import ArchivalSpace from '@js/ArchivalSpace';
import RoomForm from '@js/RoomForm';
import {sendMessage} from '@js/EphemeralMessage/sendText';
import store from '@js/store';
import publicConfig from '@public/config';
import {EGALITARIAN_MODE} from '@js/constants';

class Togethernet {
  initialize = async () => {
    await this.initDefaultRooms();
    this.attachUIEvents();
    new RoomForm().initialize();
    new PeerConnection().connect();
  }

  initDefaultRooms = async () => {
    const archivalSpace = await this.initArchivalSpace();
    const defaultEphemeralRoom = await this.initDefaultEphemeralRoom();

    store.rooms = {
      ephemeralSpace: defaultEphemeralRoom,
      archivalSpace: archivalSpace,
    };
  }

  initArchivalSpace = async () => {
    const archivalSpace = new ArchivalSpace();
    await archivalSpace.initialize();
    return archivalSpace;
  }

  initDefaultEphemeralRoom = () => {
    const defaultEphemeralRoom = new Room({
      mode: publicConfig.defaultMode || EGALITARIAN_MODE,
      ephemeral: true,
      name: 'sitting-in-the-park',
      roomId: 'ephemeralSpace',
    });
    defaultEphemeralRoom.attachEvents();
    return defaultEphemeralRoom;
  }
 
  attachUIEvents = () => {
    this.handleMessageSendingEvents();
    this.detectThreadStart();
    this.hideInteractionButtonsOnMouseLeave();
  }

  handleMessageSendingEvents = () => {
    $('#writeMessage').on('keyup', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  detectThreadStart = () => {
    $('#messageType').on('messageThread', (e) => {
      if (e.threadPreviousMessage) {
        $(e.target).attr('data-thread-entry-message', e.threadPreviousMessage.id);
      } else {
        $(e.target).removeAttr('data-thread-entry-message');
      }
    });
  }

  hideInteractionButtonsOnMouseLeave = () => {
    $(document).on('mouseup', () => $('.longPressButton').hide());
  }
}

export default Togethernet;