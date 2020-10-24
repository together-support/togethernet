import {sendMessage} from './sendMessage.js';
import {setUserName} from './user.js';

export const attachUIEvents = () => {
  $('#_nameInput').on('click', setUserName);
  $('#_sendBtn').on('click', sendMessage);
  
  $('#_messageInput').on('keyup', (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      sendMessage();
    }
  })
}