import {systemBubble} from '../components/message.js';
import store from '../store/index.js';

export const addSystemMessage = (systemMsg) => {
  $('#systemMessage').find('span').text(systemMsg);
  $('#systemMessage').show();
  $(document).one('click', clearSystemMessage);
  $(document).one('keydown', clearSystemMessage);
};

export const clearSystemMessage = () => {
  $('#systemMessage').hide();
};