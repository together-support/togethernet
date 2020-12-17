import ArchivalSpace from './ArchivalSpace/index.js';
import PeerConnection from './PeerConnection.js';

class Togethernet {
  initialize = async () => {
    await this.initArchivalSpace();
    this.attachUIEvents();
    new PeerConnection().connect();
  }

  initArchivalSpace = async () => {
    const archivalSpace = new ArchivalSpace();
    await archivalSpace.fetchArchivedMessages();
    archivalSpace.render();
  }
 
  attachUIEvents = () => {
    $(document).on('keydown', (e) => {
      if (['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.key)){
        e.preventDefault();
      }
    });
    
    $('#_messageInput').on('keyup', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  
    $('#_recordBtn').on('mousedown', startRecordingAudio);
    $('#_recordBtn').on('mouseup', sendAudio);
  
    $('#messageType').on('messageThread', (e) => {
      if (Boolean(e.threadPreviousMessage)) {
        $(e.target).attr('data-thread-entry-message', e.threadPreviousMessage.id);
      } else {
        $(e.target).removeAttr('data-thread-entry-message');
      }
    });
  
    new RoomForm().initialize();
  
    $(document).on('mouseup', () => $('.longPressButton').hide());
  
    $('#archivalSpaceLink').on('click', () => {
      $('.chat').hide();
      $('#archivalSpace').show();
      $('#_messageInput').attr('disabled', true)
    });
  }
}

export default Togethernet;