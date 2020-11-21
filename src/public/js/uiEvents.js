import {sendMessage} from './sendText.js';
import {startRecordingAudio, sendAudio} from './sendAudio.js';
import RoomForm from './RoomForm.js'

export const attachUIEvents = () => {
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

  $('#_recordBtn').on('mousedown', startRecordingAudio)
  $('#_recordBtn').on('mouseup', sendAudio)

  $('#messageType').on('messageThread', (e) => {
    if (e.shouldCreateThread) {
      $(e.target).attr('data-threaded-message', true)
    } else {
      $(e.target).attr('data-threaded-message', false)
    }
  });

  new RoomForm().initialize();

  $(document).on('mouseup', () => $('.makeFacilitator').hide());
}
