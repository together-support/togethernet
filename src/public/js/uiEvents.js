import {sendMessage} from './sendText.js';
import {startRecordingAudio, sendAudio} from './sendAudio.js';

export const attachUIEvents = () => {
  $(document).on('keydown', (e) => {
    if (['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.key)){
      e.preventDefault();
    }
  });

  $('#_sendBtn').on('click', sendMessage);
  
  $('#_messageInput').on('keyup', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  $('#_recordBtn').on('mousedown', startRecordingAudio)
  $('#_recordBtn').on('mouseup', sendAudio)

  $("#ephemeralSpace").on('keydown', hidePrivateMessage);
  $("#user").on('dragstart', hidePrivateMessage);

  $("#addRoom").on('click', addNewRoom);
}

const hidePrivateMessage = () => {
  $('.textBubble').each((_, el) => {
    $(el).hide();
  });
}

const addNewRoom = () => {

};