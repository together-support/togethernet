import store from '../store/store.js';
import {removeAllSystemMessage} from './systemMessage.js';
import {myTextRecord, textRecord, tempBubble} from '../components/message.js';


export const renderOutgoingEphemeralMessage = (data) => {
  removeAllSystemMessage();
  store.addMyActivePositions();
  store.increment('messageIndex');
  myTextRecord(data).appendTo($('#ephemeralSpace'));
  tempBubble(data).appendTo($('#user'));

  $("#ephemeralSpace").one('keydown', hidePrivateMessage);
  $("#user").one('dragstart', hidePrivateMessage);
}

export const renderIncomingEphemeralMessage = ({x, y, name, avatar, message}) => {
  store.increment('messageIndex');
  store.addActivePositions({x, y});
  textRecord({x, y, name, avatar, message}).appendTo($('#ephemeralSpace'));
}

const hidePrivateMessage = () => {
  $('.tempBubble').each((_, el) => {
    $(el).remove();
  });
  
  $('.textBubble').each((_, el) => {
    $(el).hide();
  });
}
