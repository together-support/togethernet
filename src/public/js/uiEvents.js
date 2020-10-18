import {sendMessageOnEnter, sendMessage} from './sendMessage.js';
import {setUserName} from './user.js';

export const attachUIEvents = () => {
  $('#_messageInput').on('keyup', sendMessageOnEnter)
  $('#_sendBtn').on('click', sendMessage)
  $('#_nameInput').on('click', setUserName)
}