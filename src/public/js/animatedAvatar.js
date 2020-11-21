import store from '../store/index.js';
import compact from 'lodash/compact';
import { find } from 'lodash';

export const keyboardEvent = (event) => {
  event.preventDefault();

  if(['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
    hideEphemeralMessageText();
    animationEvents[event.key]();
  }
};

const moveUp = () => {
  const newY = $('#user').position().top - $('#user').width();
  if (newY >= store.get('topBoundary')) {
    $("#user").finish().animate({top: `-=${$('#user').width()}`}, {complete: onAnimationComplete});
  }
}

const moveDown = () => {
  const newY = $('#user').position().top + $('#user').width();
  if (newY + $('#user').width() <= store.get('bottomBoundary')) {
    $("#user").finish().animate({top: `+=${$('#user').width()}`}, {complete: onAnimationComplete});
  }
}

const moveLeft = () => {
  const newX = $('#user').position().left - $('#user').width();
  if (newX >= store.get('leftBoundary')) {
    $("#user").finish().animate({left: `-=${$('#user').width()}`}, {complete: onAnimationComplete});
  }
}

const moveRight = () => {
  const newX = $('#user').position().left + $('#user').width();
  if (newX + $('#user').width() <= store.get('rightBoundary')) {
    $("#user").finish().animate({left: `+=${$('#user').width()}`}, {complete: onAnimationComplete});
  }
}

const animationEvents = {
  'ArrowUp': moveUp,
  'ArrowLeft': moveLeft,
  'ArrowRight': moveRight,
  'ArrowDown': moveDown
}

export const makeDraggableUser = () => {
  $("#user").draggable({
    grid: [$("#user").width(), $("#user").width()],
    stop: onAnimationComplete,
  });

  $("#user").on('dragstart', () => {
    hideEphemeralMessageText();
  });
}

const hideEphemeralMessageText = () => {
  store.getCurrentRoom().$room.find('.textBubble.message').each((_, el) => {
    $(el).hide();
  });
}

const onAnimationComplete = () => {
  showAdjacentMessages();
  sendPositionToPeers();
}

const showAdjacentMessages = () => {
  const {left, top} = $('#user').position();

  const adjacentMessages = compact([
    `${left}-${top + $('#user').width()}`,
    `${left}-${top - $('#user').width()}`,
    `${left - $('#user').width()}-${top}`,
    `${left + $('#user').width()}-${top}`,
  ].map(position => $(`#${store.get('currentRoomId')}-${position}`)[0]));

  adjacentMessages.forEach(messageRecord => $(messageRecord).trigger('adjacent'));

  $('#messageType').trigger({
    type: 'messageThread', 
    shouldCreateThread: adjacentMessages.length === 1
  });
}  

const sendPositionToPeers = () => {
  store.sendToPeers({
    type: 'position', 
    data: {
      x: $('#user').position().left,
      y: $('#user').position().top,
    }
  });
}