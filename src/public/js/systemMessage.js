import {systemBubble} from '../components/message.js';
import store from '../store/index.js';

export const addSystemMessage = (systemMsg) => {
  removeAllSystemMessage();
  systemBubble(systemMsg).appendTo($('#user'));
  store.getCurrentRoom().$room.one('keydown', removeAllSystemMessage);
  $('#user').one('dragstart', removeAllSystemMessage);
};

export const removeAllSystemMessage = () => {
  $('.systemBubble').each((_, el) => $(el).remove());
};