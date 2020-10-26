import {sendMessage} from './sendMessage.js';
import {setUserName} from './user.js';
import {isPrivateVisible} from './util.js'

export const attachUIEvents = () => {
  $('#_nameInput').on('click', setUserName);
  $('#_sendBtn').on('click', sendMessage);
  
  $('#_messageInput').on('keyup', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
}