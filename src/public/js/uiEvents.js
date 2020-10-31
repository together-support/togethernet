import {sendMessage} from './sendText.js';
import {startRecordingAudio, sendAudio} from './sendAudio.js';

export const attachUIEvents = () => {
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
}

const hidePrivateMessage = () => {
  $('.tempBubble').each((_, el) => {
    $(el).remove();
  });
  
  $('.textBubble').each((_, el) => {
    $(el).hide();
  });
}