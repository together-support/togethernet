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
  
  $('#_messageInput').on('keyup', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  $('#_recordBtn').on('mousedown', startRecordingAudio)
  $('#_recordBtn').on('mouseup', sendAudio)

  $('#userName').on('click', setMyUserName);

  $('#userAvatar').on('change', (e) => {
    const avatar = e.target.value
    $('#user').css('background-color', avatar);
    store.sendToPeers({type: 'profileUpdated'});
  });

  $('#messageType').on('messageThread', (e) => {
    if (e.shouldCreateThread) {
      $(e.target).attr('data-threadedMessage', true)
    } else {
      $(e.target).attr('data-threadedMessage', false)
    }
  });

  new RoomForm().initialize();

  $(document).on('mouseup', () => $('.makeFacilitator').hide());
}

const setMyUserName = () => {
  const name = DOMPurify.sanitize(prompt("Please enter your name:"));
  if (Boolean(name)) {
    $("#userName").text(name);
  }
  store.sendToPeers({type: 'profileUpdated'});
  // localStorage.setItem('tnName', name);
};