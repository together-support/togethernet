import {sendMessage} from './sendMessage.js';
import {setMyName} from './users.js';

export const attachUIEvents = () => {
  $('#_nameInput').on('click', setMyName);
  $('#_sendBtn').on('click', sendMessage);
  
  $('#_messageInput').on('keyup', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
}