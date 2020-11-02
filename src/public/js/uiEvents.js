import store from '../store/index.js';
import {sendMessage} from './sendText.js';
import {startRecordingAudio, sendAudio} from './sendAudio.js';
import DOMPurify from 'dompurify';
import RoomForm from './RoomForm.js'
import {renderUserAvatar, attachKeyboardEvents} from './ephemeral.js';

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

  $("#ephemeralSpace").on('keydown', hidePrivateMessage);
  $("#user").on('dragstart', hidePrivateMessage);

  $("#addRoom").on('click', addNewRoom);
  $('#_nameInput').on('click', setMyUserName);

  initAvatarColor();
}

const hidePrivateMessage = () => {
  $('.textBubble').each((_, el) => {
    $(el).hide();
  });
}

const setMyUserName = () => {
  const name = prompt("Please enter your name:");
  if (Boolean(name)) {
    $("#_nameInput").text(DOMPurify.sanitize(name));
  }
};

const addNewRoom = () => {
  new RoomForm().initialize();
};

const initAvatarColor = () => {
  const randomColor = Math.floor(Math.random() * 16777216).toString(16)
  const avatarColor = `#${randomColor}${'0'.repeat(6 - randomColor.length)}`.substring(0, 7);

  store.set('avatar', avatarColor);
  const $userProfile = $('#userProfile');
  $userProfile.val(avatarColor);

  $userProfile.on('change', (e) => {
    e.preventDefault();
    $('#user').css('background-color', e.target.value);
    store.sendToPeers({
      type: 'changeAvatar'
    });
  });
}

export const setUpDefaultRooms = () => {
  renderUserAvatar();
  attachKeyboardEvents($('#ephemeralSpace'));
}