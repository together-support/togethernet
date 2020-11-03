import {systemBubble} from '../components/message.js';

export const addSystemMessage = (systemMsg) => {
  removeAllSystemMessage();
  systemBubble(systemMsg).appendTo($('#user'));
  $("#ephemeralSpace").one('keydown', removeAllSystemMessage);
  $("#user").one('dragstart', removeAllSystemMessage);
}

export const removeAllSystemMessage = () => {
  $('.systemBubble').each((_, el) => $(el).remove());
}