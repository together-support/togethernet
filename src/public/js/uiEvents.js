import store from '../store/index.js';
import {sendMessage} from './sendText.js';
import {startRecordingAudio, sendAudio} from './sendAudio.js';
import DOMPurify from 'dompurify';
import RoomForm from './RoomForm.js'

export const attachUIEvents = () => {
  $(document).on('keydown', (e) => {
    if (['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.key)){
      e.preventDefault();
    }
  });

  $('#_sendBtn').on('click', sendMessage);
  
  $('#_messageInput').on('keyup', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  $('#_recordBtn').on('mousedown', startRecordingAudio)
  $('#_recordBtn').on('mouseup', sendAudio)

  $('#_nameInput').on('click', setMyUserName);

  $('#userProfile').on('change', (e) => {
    $('#user').css('background-color', e.target.value);
    store.sendToPeers({type: 'profileUpdated'});
  });

  new RoomForm().initialize();
}

const setMyUserName = () => {
  const name = prompt("Please enter your name:");
  if (Boolean(name)) {
    $("#_nameInput").text(DOMPurify.sanitize(name));
  }
  store.sendToPeers({type: 'profileUpdated'});
};