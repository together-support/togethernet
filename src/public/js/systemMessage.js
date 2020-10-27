import store from '../store/store.js';
import {systemBubble} from '../components/message.js';

export const addSystemMessage = (systemMsg) => {
  removeAllSystemMessage();
  systemBubble(systemMsg).appendTo($('#user'));
  store.increment('systemMessageIndex');
}

export const removeAllSystemMessage = () => {
  $('.systemBubble').each((_, el) => $(el).remove());
  store.set('systemMessageIndex', 0)
}
